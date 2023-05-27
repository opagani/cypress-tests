describe('landlord does not opt-in to rental protection, does not publish listing', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;
  
  const LISTING_RM_ROOT = 'rental-manager';

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.deactivateListing(listingAlias);
    });
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord does not opt-in to rental protection, does not publish listing', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then(listing => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    // clicks on the Next button at the bottom of the form and moves forward to Product Intro Page
    cy.get('@listingAlias').then((listingAlias) => {
      cy.visit(`${LISTING_RM_ROOT}/properties/${listingAlias}/listing`);
    });

    // clicks on the Next button at the bottom of the form and moves forward to Product Intro Page
    cy.get('[data-test="StatusButton"]').should('have.text', 'Next');
    cy.get('[data-test="StatusButton"]').click();

    // move to Product Details page from Product Intro Page and click "Find ot more""
    cy.get('[data-test="cta-button-1"]', { timeout: 10000 }).scrollIntoView().click();

    // should be able to see the Product Details Page and click "Not right now"
    cy.get('[data-test="rental-protection-product-details-not-right-now-btn"]').click();

    cy.contains('Publish your listing').should('be.visible');

    cy.get('button').contains('Back').click();
    cy.contains('Protect yourself against missed rent and property damage').should('be.visible');

    cy.get('button').contains('Back').click();

    // check if listing is unpublished
    cy.contains('span', 'Inactive');
  });
});
