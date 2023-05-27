describe('rent guarantee SOH onboarding flow', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;
  
  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.deactivateListing(listingAlias);
    });
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord should opt-into Rental Protection from the SOH banner', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.confirmRentalProtectionPageWillLoad(listingAlias);
    });

    cy.reload();

    // manage policy step 1 should be checked
    cy.get('[data-testid="pending-step-check-completed-0"]').should('be.visible');

    // security deposit should match the amount entered in the opt-in flow
    cy.get('[data-testid="security-deposit"]').should('have.text', '$0.00');
  });
});
