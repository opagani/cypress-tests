import { getFindTenantPageUrl } from '../../support/listings/paths';

describe('rent guarantee SOH onboarding flow and dropping', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;
  
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cy.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false;
    });
    Cypress.Cookies.preserveOnce('ZG_RENT_GUARANTEE_ENABLED', 'dev_brand', 'loginmemento', 'ZILLOW_SSID', 'ZILLOW_SID');
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

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.confirmListingExistsInListingHub(listingAlias);
      cy.visit(getFindTenantPageUrl(listingAlias));
    });

    // should move forward to onboarding ProductIntro page when clicking on rental-protection banner
    cy.get('[data-test="rental-protection-banner"]').should('be.visible');
    cy.get('[data-test="rental-protection-banner"]').scrollIntoView().click();

    // opt in to rental protection
    cy.optInToRentalProtection();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.confirmRentalProtectionPageWillLoad(listingAlias);
    });

    cy.reload();

    // manage policy step 1 should be checked
    cy.get('[data-testid="pending-step-check-completed-0"]').should('be.visible');

    // drop policy
    cy.get('[data-testid="drop-policy-cta"]').should('be.visible').click();
    cy.get('[data-testid="submit-button"]').should('be.visible').click();
    cy.get('[data-test="rental-protection-banner"]').should('be.visible');
    cy.contains("Rental Protection Request Dropped");
    
  });
});
