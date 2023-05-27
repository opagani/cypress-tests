const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const retry = require('async-retry');

const formatAddress = require('../utils/formatAddress');
const RENTAL_PROTECTION_ACCEPTED_STATES = require('../constants/RENTAL_PROTECTION_ACCEPTED_STATES');

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`);

  // eslint-disable-next-line no-console
  console.log(`Using config file: ${pathToConfigFile}`);

  return fs.readJson(pathToConfigFile);
}

function getResolvedConfiguration(config) {
  return new Promise(async (resolve) => {
    const configFile = config.env.configFile || 'qa';
    let envConfig = await getConfigurationByFile(configFile);
    envConfig = {
      ...config,
      ...envConfig,
      env: {
        ...config.env,
        ...envConfig.env,
      },
    };

    return resolve(envConfig);
  });
}

async function getNumListingsForState(stateCode) {
  const searchRes = await axios({
    url: 'https://searchplatform-service-master-z.apps-blue.dev.zg-search.net/api/v1/search',
    method: 'get',
    params: {
      query: `location=state:${stateCode}`,
      limit: 1,
      homeType: 'SINGLE_FAMILY',
      context: 'PUBLIC_RECORDS',
      client: 'qa',
    },
  });

  if (!searchRes?.data) {
    throw new Error('getNumListingsForState: no listing data returned from search api');
  }

  return searchRes.data.found;
}

async function generateRandomListingAddress(env) {
  try {
    const acceptedStates = env.acceptedStates ? env.acceptedStates.split(',') : RENTAL_PROTECTION_ACCEPTED_STATES;
    /**
    ex: acceptedStatesOffsetLimits structure
    [
      {
        stateCode: 'CO',
        offsetLimit: 14,
      },
      {
        stateCode: 'NC',
        offsetLimit: 395,
      },
      {
        stateCode: 'AZ',
        offsetLimit: 21,
      },
    ] */

    const acceptedStatesOffsetLimits = await Promise.all(
      acceptedStates.map(async (stateCode) => {
        const numListingsFound = await getNumListingsForState(stateCode);
        return { stateCode, offsetLimit: numListingsFound > 1000 ? 1000 : numListingsFound};
      }),
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(acceptedStatesOffsetLimits, null, 2));

    // Choose random state
    const randomStateIndex = Math.floor(Math.random() * acceptedStatesOffsetLimits.length);
    const randomState = acceptedStatesOffsetLimits[randomStateIndex];
    const randomOffset = Math.floor(Math.random() * randomState.offsetLimit);

    // https://zwiki.zillowgroup.net/pages/viewpage.action?spaceKey=FIND&title=ZG+Search+Platform+-+Search+API+Query+101
    // https://searchplatform-service-master-z.apps-blue.dev.zg-search.net/api/v1/search?query=location=state:AZ%20OR%20CO%20OR%20NC&offset=0&limit=10&homeType=SINGLE_FAMILY&context=FOR_RENT&client=qa
    const listings = await axios({
      url: 'https://searchplatform-service-master-z.apps-blue.dev.zg-search.net/api/v1/search',
      method: 'get',
      params: {
        query: `location=state:${randomState.stateCode}`,
        offset: randomOffset,
        limit: 1,
        homeType: 'SINGLE_FAMILY',
        context: 'PUBLIC_RECORDS',
        client: 'qa',
      },
    });

    if (!listings?.data?.data) {
      throw new Error('listing search returned empty');
    }

    const listing = listings.data.data[0].data;
    const address = listing.PropertyInfo.Address;
    const formattedAddress = formatAddress(address);

    // eslint-disable-next-line no-console
    console.log(formattedAddress);

    const restrictionsResponse = await axios({
      url: 'https://comet1.testpads.net/rental-manager/proxy/rental-manager-api/api/v1/users/properties/locations/restrictions',
      method: 'get',
      params: {
        fullAddress: formattedAddress,
        listingTypeCode: 1,
      },
      withCredentials: true,
      headers: {
        Cookie: 'ZG_MOCK_USER_ENABLED=true; dev_brand=zillow',
      },
    });
    const rentalManagerRestrictions = restrictionsResponse?.data?.response;
    const { paidListingExists, isTopListingOwner, duplicateExists, forSaleExists } = rentalManagerRestrictions;

    if (!rentalManagerRestrictions) {
      throw new Error('rentalManagerRestrictions returned empty');
    }

    if ((paidListingExists && !isTopListingOwner) || duplicateExists || forSaleExists) {
      throw new Error(`${formattedAddress} is a duplicate or paid listing`);
    }

    return formattedAddress;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    throw e;
  }
}

module.exports = (on, config) => {
  on('task', {
    log(message) {
      // eslint-disable-next-line no-console
      console.log(message);
      return null;
    },
    async createRandomListingAddress() {
      return await retry(
        async () => {
          return await generateRandomListingAddress(config.env);
        },
        {
          retries: 5,
          onRetry: (err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            // eslint-disable-next-line no-console
            console.log(`generateRandomListingAddress failed. Retrying...`);
          },
        },
      );
    },
  });

  return getResolvedConfiguration(config).catch((reason) => {
    // eslint-disable-next-line no-console
    console.error(`Failed to get configuration ${reason}`);
  });
};
