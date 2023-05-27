import { getFindTenantPageUrl } from '../../support/listings/paths';

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

  // RGZD-141
  it('landlord should opt-into Rental Protection from the posting path and waive security deposit', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(getFindTenantPageUrl(listingAlias));
    });

    // should be able enter the edit listing long form
    cy.get('[data-test="connect-listing-list-my-property-cta"]').should('be.visible');
    cy.get('[data-test="connect-listing-list-my-property-cta"]').click();

    // should be able to see the long form and enter my data and click on Next
    cy.get('[data-test="StatusButton"]').should('be.visible');
    cy.get('[data-test="StatusButton"]').click();

    // move to Product Details page from Product Intro Page
    cy.get('[data-test="cta-button-1"]').scrollIntoView().click();

    // should move forward to Wizard Step 1: Security Deposit
    cy.get('[data-test="title"]').should('not.exist');
    cy.get('[data-test="rental-protection-product-details-continue-btn"]').click();
    cy.get('[data-test="title"]').should('be.visible');

    // should waive security deposit when selected
    cy.get('[data-test="title"]').scrollIntoView().should('be.visible');
    cy.get('[id="waive-security-deposit"]').click();
    cy.get('[data-test="security-deposit-input"]').should('not.exist');

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

    // should publish listing
    cy.get('[data-test="publish-listing-button"]').click();

    // landlord should be able to click on Rental Protection banner on the SoH page

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.confirmRentalProtectionPageWillLoad(listingAlias);
      cy.visit(getFindTenantPageUrl(listingAlias));
    });

    cy.get('[data-test="rental-protection-banner"]').click();

    // manage policy step 1 should be checked
    cy.get('[data-test="policy-module-step-item-check-circle-0"]').should('be.visible');

    // security deposit should match the amount entered in the opt-in flow
    cy.get('[data-test="security-deposit"]').should('have.text', '$0.00');
  });
});
