describe('landlord opt-in, application received, eligibility updated', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received, eligibility updated', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: true, isIncomeToRentEligible: true });

    cy.get('[data-test="change-eligibility-link"]').click();

    cy.get('[data-test="document-controller-document-card"]').click();
    cy.get('[data-test="multi-applicant-document-view-done-btn"').click();
    cy.get('[data-test="verify-income-ineligible-cta"]').click();
    cy.get('[data-test="verify-income-info-confirmation-modal-footer-button"]').click();
    cy.get('[data-test="application-rollup-rg-ineligible-alert"]').should('exist');
  });
});
