# Rental Protection Cypress Testing

# Table of contents

1. [Goal](#goal)
2. [Setup](#setup)
3. [CLI Commands](#cli-commands)
4. [Video/Screenshots](#video-screenshots)
5. [Swiching between users](#switching-between-users)
6. [Comet Rentals Commands](#comet-rentals-commands)
7. [Web Interface](#web-interface)
    - [Quickstart](#web-interface-quickstart)
    - [Deployment](#web-interface-deployment)

<a name="goal"></a>

# Goal

The primary goal of the Rental Protection cypress tests are to create reliability and confidence in our product before we ship it to production. Another benefit of the tests are that they help with data generation. Being able to create a user that has gone through parts of the Rental Protection flow is useful for testing and QA.

<a name="setup"></a>

# Setup

1. Use node version >= 14.15
2. Run `npm install`

<a name="cli-commands"></a>

# CLI Commands

When working on localhost you'll primarily want to use the [Cypress Test Runner](https://docs.cypress.io/guides/core-concepts/test-runner#Overview)
To open the Cypress Test Runner use the following command:

```
npm run cypress:open
```

To run Cypress tests in CLI (env defaults to `qa`)

```
npm run cypress
```

To run cypress tests against localhost:3001

```
npm run cypress -- --env configFile=local
```

Available configFile environments: `qa`, `local`, `ttest1`

These can also be found in `rent-guarantee-admin-web/cypress/config/`

To run a specific cypress test file

```
npm run cypress -- --spec "cypress/integration/leases/upload-signed-lease.int.spec.ts"
```

Environment variables
- `leaseStartDate`
  - String date that defines the lease start date for the rental protection policy
  - Ex: leaseStartDate=1/1/2022
- `leaseEndDate`
  - String date that defines the lease end date for the rental protection policy
  - Ex: leaseEndDate=1/1/2023
- `acceptedStates`
  - List of state codes used during listing creation. A state will be randomly chosen and a listing will be created in that chosen state
- `enableRentalProtectionWithApi`
  - Boolean, if true will enable rental protection with an http request instead of through the posting path onboarding UI

Ex
```
npm run cypress -- --env acceptedStates=NC,enableRentalProtectionWithApi=true
```

<a name="test-file-structure"></a>

# Test File Structure

For the cypress tests we primarily try to keep tests specific to one scenario, with the file name matching that scenario. This is so that we can run each file individually and generate a single listing and user per test, so that the credentials can be reused for testing or QA.

```
cypress/
├─ integration/
│  ├─ applications/
│  ├─ leases/
│  ├─ manage-policy/
│  ├─ payments/
│  │  ├─ coverage-request-signing.int.spec.ts
```

<a name="switching-between-users"></a>

# Switching Between Users

To switch between users we use a [custom cypress command](https://docs.cypress.io/api/cypress-api/custom-commands), `cy.createUserByEmail(emailAddress);`
Source code [here](https://bitbucket.hotterpads.com/projects/RP/repos/rentals-js/browse/apps/rent-guarantee-admin-web/cypress/support/listings/commands.js#109)
Ex:

```js
const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

// Create landlord
cy.createUserByEmail(landlordEmail);

// Do something with landlord cred

// Create renter
cy.createUserByEmail(renterEmail);

// Do something with renter cred
// Ex: complete and submit application with income documents
// cy.createAndSubmitApplication(shouldUploadIncomeDocs);

// switch back to landlord
cy.createUserByEmail(landlordEmail);
```

`cy.createUserByEmail` uses the [Cypress session](https://docs.cypress.io/api/commands/session) feature, which caches the user credentials and makes it easier to switch between the landlord and renter

<a name="comet-rentals-commands"></a>

# Comet Rentals Commands

All comet rental [custom commands](https://docs.cypress.io/api/cypress-api/custom-commands) can be found in the `cypress/support/` directory. They are separated by team/product

```
- support
  - applications
  - leases
  - payments
  - listings
  ...
```

<a name="web-interface"></a>
# Web Interface

The source code for the web interface can be found in the `/src` directory. 

- Bundler - [Parcel.js](https://parceljs.org/)
- Web Components - [Constellation](http://constellation.pages.zgtools.net/constellation-site/)
- Hosted on [Gitlab Pages](https://docs.gitlab.com/ee/user/project/pages/)
- Pipelines are triggered via Gitlab's [Pipeline API](https://docs.gitlab.com/ee/api/pipelines.html)

<a name="web-interface-quickstart"></a>
## Quickstart
```bash
node --version
v14.16.1

npm install
npm run dev
Server running at http://localhost:1234
```

<a name="web-interface-deployment"></a>
## Deployment
The Rental Protection cypress tests web interface is deployed to Gitlab Pages by moving the production build's static assets to the repo's `/public` directory.

```
pages:
  stage: pages
  script:
    - mv -f dist/ public/
```
See the project's `.gitlab-ci.yml` under the `pages` stage for source implementation
