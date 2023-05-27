const LISTING_RM_ROOT = 'rental-manager';

describe('rent guarantee onboarding flow', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;
  
  before(() => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();
    cy.setCookie('ZG_RENT_GUARANTEE_BACKDOOR_ENABLED', 'true');
  });

  beforeEach(() => {
    cy.preTestScript();
    
    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(`${LISTING_RM_ROOT}/rental-protection/properties/${listingAlias}/`);
    });
  });

  after(() => {
    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.deactivateListing(listingAlias);
    });
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('should load onboarding page', () => {
    cy.get('body').should('be.visible');
  });

  it('should move forward to security deposit screen when initiated', () => {
    cy.contains('Do you still want a security deposit?').should('not.exist');
    cy.get('[data-test="cta-button-1"]').scrollIntoView().click();
    cy.get('[data-test=rental-protection-product-details-continue-btn]').click();
    cy.contains('Do you still want a security deposit?').should('be.visible');
  });

  it('should set security deposit when required', () => {
    cy.get('[data-test="cta-button-1"]').scrollIntoView().click();
    cy.get('[data-test=rental-protection-product-details-continue-btn]').click();
    cy.get('[id="require-security-deposit"]').click();
    cy.get('[data-test="security-deposit-input"]').type('1500');
    cy.get('[data-test="security-deposit-input"]').should('have.value', '1500');
  });
});
