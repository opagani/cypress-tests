import 'cypress-iframe';
import { getFindTenantPageUrl, getListingPageUrl } from '../../support/listings/paths';

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
    cy.forceEnrollUserIntoTwoStepOptIn();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.applicationsAccepted(listingAlias);
      cy.petsPolicy(listingAlias);
      
      cy.visit(getListingPageUrl(listingAlias));

      cy.get('[data-test="next-button"]').should('have.text', 'Next');
      cy.get('[data-test="next-button"]').click();

      // opt in to rental protection
      cy.optInToRentalProtectionWithTwoStepOptInWhenCreatingListing();
      
      cy.visit(getFindTenantPageUrl(listingAlias));

      cy.get('[data-test="rental-protection-banner"]').click();

      // landlord should see Manage Policy checklist with step 1 complete
      cy.get('[data-testid="pending-step-check-completed-0"]').should('be.visible');
    });
  });
});
