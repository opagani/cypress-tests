import { getLandlordApplicationOverviewUrl } from '../../support/applications/paths';

describe('landlord opt-in, application received', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: false });

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.get<number>('@applicationId').then((applicationId) => {
        cy.visit(getLandlordApplicationOverviewUrl(applicationId, listingAlias));

        // mark income doc eligibility
        cy.get('[data-test="verify-income-button"]').click();

        cy.get('[data-test="document-controller-document-card"]').click();
        cy.get('[data-test="multi-applicant-document-view-done-btn"').click();
      });
    });
  });
});
