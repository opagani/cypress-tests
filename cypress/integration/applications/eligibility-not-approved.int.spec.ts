describe('landlord opt-in, application received, eligibility not approved', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received, eligibility not approved', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: true, isIncomeToRentEligible: false });
  });
});
