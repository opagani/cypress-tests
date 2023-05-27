import { getLandlordApplicationOverviewUrl } from '../../support/applications/paths';

describe('landlord opt-in, application received, eligibility approved', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received with missing income docs', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldUploadIncomeDocs: false, shouldVerifyIncomeDocs: false });

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.get<number>('@applicationId').then((applicationId) => {
        cy.visit(getLandlordApplicationOverviewUrl(applicationId, listingAlias));
      });
    });

    // request income docs
    cy.intercept('POST', 'graphql', (req) => {
      if (
        req.body[0].hasOwnProperty('operationName') &&
        req.body[0].operationName.includes('sendApplicationResubmitNotification')
      ) {
        req.alias = 'sendApplicationResubmitNotificationGQLQuery';
      }
    });

    cy.get('[data-test="request-income-docs-button"]').click();
    cy.get('[data-test="request-income-docs-modal-footer-button"]').click();

    cy.wait('@sendApplicationResubmitNotificationGQLQuery')
      .debug()
      .its('response.body')
      .should((body) => {
        assert.equal(body[0].data.sendApplicationResubmitNotification.success, true);
      });
  });
});
