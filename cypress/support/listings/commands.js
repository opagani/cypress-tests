const { ENABLE_RENTAL_PROTECTION_WITH_API } = require('../../constants/CYPRESS_ENV_VARS');
const { GET_LISTING_EXISTS_IN_LISTING_HUB_URL } = require('../applications/paths');
const {
  ENABLE_RENT_GUARANTEE,
  GET_RENTAL_PROTECTION_PAGE_FOR_LISTING,
  GET_USER,
  GET_DETAILS,
  REGISTER_ACCOUNT,
  DEACTIVATE_LISTING,
  CREATE_FAKE_LISTING,
  APPLICATIONS_ACCEPTED,
  CRITERIA,
  getFindTenantPageUrl,
} = require('./paths');

const SECURITY_DEPOSIT_AMOUNT = '1500';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/*
  const RM_ROOT = '/rental-manager/';
  const userToken = '1111111111';
  cy.loginAsMockedUserByToken(userToken, `${RM_ROOT}`);
*/
Cypress.Commands.add('loginAsMockedUserByToken', (mockedUserToken, rentalManagerRoot) => {
  cy.visit(rentalManagerRoot);
  cy.setCookie('ZG_RENT_GUARANTEE_ENABLED', 'true');
  cy.setCookie('ZG_ID_VERIFICATION_ENABLED', 'true');
  cy.setCookie('ZG_MOCK_USER_ENABLED', 'true');
  cy.setCookie('dev_brand', 'zillow');
  cy.setCookie('ZG_MOCK_USER_TOKEN', mockedUserToken);
});

Cypress.Commands.add('loginAsMockedUserByEmail', (mockedUserToken, rentalManagerRoot) => {
  cy.visit(rentalManagerRoot);
  cy.setCookie('ZG_RENT_GUARANTEE_ENABLED', 'true');
  cy.setCookie('ZG_ID_VERIFICATION_ENABLED', 'true');
  cy.setCookie('ZG_MOCK_USER_ENABLED', 'true');
  cy.setCookie('dev_brand', 'zillow');
  cy.setCookie('ZG_MOCK_USER_EMAIL', mockedUserToken);
});

Cypress.Commands.add('createListing', ({ activate = false, streetAddress } = {}) => {
  cy.task('log', `createListing STARTED`);
  return cy.task('createRandomListingAddress').then((formattedAddress) => {
    cy.request({
      url: CREATE_FAKE_LISTING,
      qs: {
        listingTypeCode: 1,
        propertyTypeCode: 6,
        activate,
        numListings: 1,
        streetAddress: streetAddress ? streetAddress : formattedAddress,
      },
    }).as('createFakeListing');

    return cy.get('@createFakeListing').then((response) => {
      if (response?.body?.response?.listings[0]?.listingAlias) {
        cy.task('log', `createListing FINISHED`);
        cy.task('log', `listingAlias: ${response.body.response.listings[0].listingAlias}`);
        cy.task('log', `listingInformation: ${JSON.stringify(response, null, 2)}`);
      }

      assert.equal(response.status, 200);
      return cy.wrap(response?.body?.response?.listings[0]);
    });
  });
});

Cypress.Commands.add('createUserByEmail', (email) => {
  cy.session([email], () => {
    cy.task('log', `Creating user with email: ${email}`);
    const password = 'str0ngPassword1';

    cy.request({
      url: REGISTER_ACCOUNT,
      qs: {
        email,
        password,
      },
    }).as('zillowAccountRegistration');

    cy.get('@zillowAccountRegistration').then((response) => {
      cy.setCookie('dev_brand', 'zillow');
      cy.setCookie('ZG_RENT_GUARANTEE_ENABLED', 'true');
      cy.setCookie('ZG_ID_VERIFICATION_ENABLED', 'true');
      // one trust cookie preference modal shows up on first page view
      // add cookie to stop modal from automatically showing
      cy.setCookie('OptanonAlertBoxClosed', new Date().toISOString())
      assert.equal(response.status, 200);
      cy.task('log', 'New user created');
      cy.task('log', `Headers: ${JSON.stringify(response.headers, null, 2)}`);
      return cy.wrap(email);
    });

    cy.task('log', `User email: ${email}`);
    cy.task('log', `User password: ${password}`);
  });
});

Cypress.Commands.add('getUserZuid', () => {
  cy.request(GET_USER).then((response) => {
    cy.task('log', `getUserZuid ${JSON.stringify(response, null, 2)}`);
    assert.equal(response.status, 200);
    return cy.wrap(response.body.response.userToken);
  });
});

export function pollEndpoint({ requestParams, retryLimit = 25, assertionCallback = () => true }) {
  // 12 * 5s = 60s timeout
  let retryCount = 0;
  const delayMs = 5000;

  const recurse = ({ requestParams, retryLimit, assertionCallback }) => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(delayMs);
    cy.task('log', `Polling ${requestParams.url} for a 200 response`);

    cy.request(requestParams).then((resp) => {
      // if we got what we wanted

      cy.task('log', JSON.stringify(resp, null, 2));
      if (resp.status === 200 && assertionCallback(resp.body)) {
        // break out of the recursive loop
        return;
      }

      cy.task('log', `retryCount: ${retryCount}`);
      cy.task('log', `retryLimit: ${retryLimit}`);
      if (retryCount >= retryLimit) {
        assert.isBelow(retryCount, retryLimit, 'retry limit has been reached');
        return;
      }

      // else recurse
      retryCount++;
      recurse({ requestParams, retryLimit, assertionCallback });
    });
  };
  recurse({ requestParams, retryLimit, assertionCallback });
}

function confirmListingExistsInListingHub(listingAlias) {
  pollEndpoint({
    requestParams: {
      url: GET_LISTING_EXISTS_IN_LISTING_HUB_URL,
      qs: {
        listingAlias,
        apiKey: 'changeit',
      },
    },
    assertionCallback: (body) => body.isTrue === true,
  });
}

Cypress.Commands.add('confirmListingExistsInListingHub', (listingAlias) => {
  cy.task('log', `confirmListingExistsInListingHub STARTED`);
  return confirmListingExistsInListingHub(listingAlias);
});

function confirmRentalProtectionPageWillLoad(listingAlias) {
  pollEndpoint({
    requestParams: {
      url: GET_RENTAL_PROTECTION_PAGE_FOR_LISTING,
      qs: {
        listingAlias,
        apiKey: 'changeit',
      },
      failOnStatusCode: false,
    },
  });
}
Cypress.Commands.add('confirmRentalProtectionPageWillLoad', (listingAlias) => {
  cy.task('log', `confirmRentalProtectionPageWillLoad STARTED`);
  return confirmRentalProtectionPageWillLoad(listingAlias);
});

Cypress.Commands.add('deactivateListing', (propertyId) => {
  if (propertyId) {
    cy.request({
      url: DEACTIVATE_LISTING,
      qs: {
        propertyId,
      },
    }).as('deactivateListing');
    cy.get('@deactivateListing').then((response) => {
      if (response?.body?.response?.listingAlias) {
        cy.wrap(response.body.response.listingAlias)
          .as('listingAlias')
          .then((listingAlias) => cy.task('log', `deactivated listing ${listingAlias}`));
      }
      assert.equal(response.status, 200);
      return;
    });
  }
});

Cypress.Commands.add('forceEnrollUserIntoRentalProtectionExperiment', () => {
  cy.request({
    url: `rental-manager/labster-proxy/labster/api/v1/experiments/variations/forceEnroll`,
    qs: {
      appName: 'rental-manager-web',
      experimentName: 'zrm-rental-protection-v2',
      variation: 'EXPERIMENT',
    },
  }).as('forceEnrollUserIntoRentalProtectionExperiment');

  cy.get('@forceEnrollUserIntoRentalProtectionExperiment').then((response) => {
    cy.task('log', response);
    assert.equal(response.status, 200);
    return;
  });
});

Cypress.Commands.add('forceEnrollUserIntoTwoStepOptIn', () => {
  cy.request({
    url: `rental-manager/labster-proxy/labster/api/v1/experiments/variations/forceEnroll`,
    qs: {
      appName: 'rental-manager-web',
      experimentName: 'rental-protection-two-step-opt-in',
      variation: 'EXPERIMENT',
    },
  }).as('forceEnrollUserIntoTwoStepOptIn');

  cy.get('@forceEnrollUserIntoTwoStepOptIn').then((response) => {
    cy.task('log', response);
    assert.equal(response.status, 200);
    return;
  });
});

Cypress.Commands.add('forceUnenrollUserFromRachelPays', () => {
  cy.request({
    url: `rental-manager/labster-proxy/labster/api/v1/experiments/variations/forceEnroll`,
    qs: {
      appName: 'rental-manager-web',
      experimentName: 'rental-protection-rachel-pays',
      variation: 'NOT_ENROLLED',
    },
  }).as('forceUnenrollUserFromRachelPays');

  cy.get('@forceUnenrollUserFromRachelPays').then((response) => {
    cy.task('log', response);
    assert.equal(response.status, 200);
    return;
  });
});

Cypress.Commands.add('forceEnrollUserIntoModularListingRentalProtectionExperiment', () => {
  cy.setCookie('ZG_RENT_GUARANTEE_ENABLED', 'true');
  cy.setCookie('ZG_RENTAL_GUARANTEE_FROM_ML_FLOW_ENABLED', 'true');
  cy.setCookie('ZG_MODULAR_LISTING_ENABLED', 'true');
  cy.request({
    url: `rental-manager/labster-proxy/labster/api/v1/experiments/variations/forceEnroll`,
    qs: {
      appName: 'rental-manager-web',
      experimentName: 'rental-protection-from-ml-v1',
      variation: 'EXPERIMENT',
    },
  }).as('forceEnrollUserIntoModularListingRentalProtectionExperiment');

  cy.get('@forceEnrollUserIntoModularListingRentalProtectionExperiment').then((response) => {
    cy.task('log', response);
    assert.equal(response.status, 200);
    return;
  });
});

Cypress.Commands.add('getDetails', (propertyId) => {
  cy.request({
    url: GET_DETAILS,
    qs: {
      propertyId,
    },
  }).as('getDetails');

  cy.get('@getDetails').then((response) => {
    cy.wrap(response.body.response.rentGuarantee.isEnabled)
      .as('isRentGuaranteeEnabled')
      .then((isRentGuaranteeEnabled) => cy.task('log', `isRentGuaranteeEnabled: ${isRentGuaranteeEnabled}`));

    assert.equal(response.status, 200);
    return;
  });
});

Cypress.Commands.add('optInToRentalProtection', () => {
  // move to Product Details page from Product Intro Page
  cy.get('[data-testid="product-intro-illustrative-get-started"]', { timeout: 10000 }).scrollIntoView().click();

  // should move forward to Wizard Step 1: Security Deposit
  cy.get('[data-test="title"]').should('not.exist');
  cy.get('[data-test="rental-protection-product-details-continue-btn"]', { timeout: 10000 }).click();
  cy.get('[data-test="title"]').should('be.visible');

  // should waive security deposit when selected
  cy.get('[data-test="title"]').scrollIntoView().should('be.visible');
  cy.get('[id="waive-security-deposit"]').click();
  cy.get('[data-test="security-deposit-input"]').should('not.exist');

  // should set security deposit when required
  cy.get('[id="require-security-deposit"]').click();
  cy.get('[data-test="security-deposit-input"]').type(SECURITY_DEPOSIT_AMOUNT);
  cy.get('[data-test="security-deposit-input"]').should('have.value', SECURITY_DEPOSIT_AMOUNT);

  // should move to Wizard Step 2: Tools
  cy.get('[data-test="online-tools-checkbox"]').should('not.exist');
  cy.get('[data-test="next-button"]').click();
  cy.get('[data-test="online-tools-checkbox"]').first().scrollIntoView().should('be.visible');

  // should be able to agree to use the tools
  cy.get('[data-test="next-button"]').should('be.disabled');
  cy.get('[data-test="online-tools-checkbox"]').first().click();

  // should be able to go to Wizard Step 3: Review
  cy.get('[data-test="next-button"]').should('not.be.disabled');
  cy.get('[data-test="next-button"]').click();

  // should see Wizard step 3: Review
  cy.get('[data-test="Rental Protection premium"]').should('be.visible');
  cy.get('[data-test="Security deposit"]').should('be.visible');
  cy.get('[data-test="Online tools"]').should('be.visible');

  // go to next page
  cy.get('[data-test="next-button"]').click();
});

Cypress.Commands.add('optInToRentalProtectionWithTwoStepOptIn', () => {
  cy.get('[data-testid="product-intro-illustrative-get-started"]', { timeout: 10000 }).scrollIntoView().click();

  cy.get('[data-testid="RentalProtectionHowDoesItWorkModalBody"]', { timeout: 10000 }).contains('How to purchase Rental Protection')
  cy.get('[data-testid="rental-protection-two-step-opt-in-modal"]', { timeout: 10000 }).find('[data-testid="submit-button"]').click();
  cy.get('[data-testid="RentalProtectionInterestedModalBody"]', { timeout: 10000 }).contains('Interested in Rental Protection?')
  cy.get('[data-testid="rental-protection-two-step-opt-in-modal"]', { timeout: 10000 }).find('[data-testid="submit-button"]').click();

  cy.get('[data-testid="rental-protection-two-step-opt-in-review-security-deposit-modal"]', { timeout: 10000 }).find('[data-test="waive-security-deposit"]').click();
  cy.get('[data-testid="rental-protection-two-step-opt-in-review-security-deposit-modal"]', { timeout: 10000 }).find('[data-testid="submit-button"]').click();

  cy.get('[data-testid="rental-protection-two-step-opt-in-review-security-deposit-confirmation-modal"]', { timeout: 10000 }).find('[data-testid="submit-button"]').click();
});

Cypress.Commands.add('optInToRentalProtectionWithTwoStepOptInWhenCreatingListing', () => {
  cy.get('[data-testid="product-intro-illustrative-get-started"]', { timeout: 10000 }).first().scrollIntoView().click();
  
  cy.get('[data-testid="rental-protection-two-step-opt-in-how-does-it-work-modal"]', { timeout: 10000 }).find('[data-testid="submit-button"]').click();
  cy.get('[data-testid="rental-protection-two-step-opt-in-interested-modal"]', { timeout: 10000 }).find('[data-testid="submit-button"]').click();
  
  cy.get('[data-test="waive-security-deposit"]').click();
  cy.get('[data-test="next-button"]').click();
});

Cypress.Commands.add('payAndPublishListing', () => {
  cy.get('#zuora_payment', { timeout: 15000 }).should('be.visible');
  cy.iframe('#z_hppm_iframe').find('#input-creditCardHolderName', { timeout: 10000 }).type('rental protection');
  cy.iframe('#z_hppm_iframe').find('[id="input-creditCardNumber"]').type('4242 4242 4242 4242');
  cy.iframe('#z_hppm_iframe').find('[id="input-creditCardExpirationMonth"]').select('01');
  cy.iframe('#z_hppm_iframe').find('[id="input-creditCardExpirationYear"]').select('2026');
  cy.iframe('#z_hppm_iframe').find('[id="input-cardSecurityCode"]').type('123');
  cy.iframe('#z_hppm_iframe').find('[id="input-creditCardPostalCode"]').type('12345');
  cy.iframe('#z_hppm_iframe').find('[id="submitButton"]').click();
});

Cypress.Commands.add('enableRentGuaranteeWithApi', (listingAlias) => {
  cy.request({
    url: ENABLE_RENT_GUARANTEE,
    qs: {
      listingAlias,
      waiveSecurityDeposit: false,
      securityDeposit: Number(SECURITY_DEPOSIT_AMOUNT).toFixed(2),
    },
  }).as('enableRentGuarantee');

  cy.get('@enableRentGuarantee').then((response) => {
    cy.task('log', `Enabling rental protection for listing alias: ${listingAlias}`);
    cy.task('log', JSON.stringify(response, null, 2));
  });
});

Cypress.Commands.add('completeSenseOfHomeBannerOptin', () => {
  cy.task('log', `completeSenseOfHomeBannerOptin STARTED`);

  if (Cypress.env(ENABLE_RENTAL_PROTECTION_WITH_API)) {
    cy.get('@listingAlias').then((listingAlias) => {
      cy.enableRentGuaranteeWithApi(listingAlias);
    });

    return;
  }

  cy.forceEnrollUserIntoTwoStepOptIn();
  cy.forceUnenrollUserFromRachelPays();

  cy.get('@listingAlias').then((listingAlias) => {
    cy.confirmListingExistsInListingHub(listingAlias);
    cy.visit(getFindTenantPageUrl(listingAlias));
  });

  // should move forward to onboarding ProductIntro page when clicking on rental-protection banner
  cy.get('[data-test="rental-protection-banner"]').should('be.visible');
  cy.get('[data-test="rental-protection-banner"]').scrollIntoView().click();

  // opt in to rental protection
  cy.optInToRentalProtectionWithTwoStepOptIn();

  cy.task('log', `completeSenseOfHomeBannerOptin FINISHED`);
});

Cypress.Commands.add('applicationsAccepted', (listingAlias) => {
  cy.request({
    url: APPLICATIONS_ACCEPTED,
    qs: {
      propertyId: listingAlias,
      applicationsAccepted: true,
    },
  }).as('applicationsAccepted');

  cy.get('@applicationsAccepted').then((response) => {
    cy.task('log', `Enabling applications for listing alias: ${listingAlias}`);
    cy.task('log', JSON.stringify(response, null, 2));
  });
});

Cypress.Commands.add('petsPolicy', (listingAlias) => {
  cy.request({
    method: "POST",
    url: CRITERIA,
    qs: {
      propertyId: listingAlias
    },
    body: {
      criteria: [
        {
          criterion: "0",
          negotiable: false, 
          type: "petPolicyDogCount",
        },
        {
          criterion: "0",
          negotiable: false, 
          type: "petPolicyCatCount",
        },
      ]
    },
  }).as('petsPolicy');

  cy.get('@petsPolicy').then((response) => {
    cy.task('log', `Setting pets policy for listing alias: ${listingAlias}`);
    cy.task('log', JSON.stringify(response, null, 2));
  });
});
