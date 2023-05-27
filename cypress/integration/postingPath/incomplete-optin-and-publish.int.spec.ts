import { getListingPageUrl } from '../../support/listings/paths';

describe('landlord opting in and paying for listing to be published', () => {
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

  it('landlord opting in and paying for listing to be published', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(getListingPageUrl(listingAlias));
    });

    const SECURITY_DEPOSIT = '1500';

    // clicks on the Next button at the bottom of the form and moves forward to Product Intro Page
    cy.get('[data-test="StatusButton"]', { timeout: 10000 }).should('have.text', 'Next');
    cy.get('[data-test="StatusButton"]').click();

    // move to Product Details page from Product Intro Page
    cy.get('[data-test="cta-button-1"]', { timeout: 10000 }).scrollIntoView().click();

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
    cy.get('[data-test="security-deposit-input"]').type(SECURITY_DEPOSIT);
    cy.get('[data-test="security-deposit-input"]').should('have.value', SECURITY_DEPOSIT);

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

    // exit Wizard
    cy.get('[data-test="desktop-exit-button"]').click();
    cy.get('[data-testid="rental-protection-exit-button"]').click();

    // Publish Listing
    cy.get('[data-test="enable-applications"]', { timeout: 10000 }).click();
    cy.get('[data-test="publish-listing-button"]').click();
  });
});
