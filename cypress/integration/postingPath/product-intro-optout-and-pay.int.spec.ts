import { getFindTenantPageUrl, getListingPageUrl } from '../../support/listings/paths';

describe('landlord does not opt-in to rental protection, turns on applications', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.get<string>('@firstListingAlias').then((firstListingAlias) => {
      cy.deactivateListing(firstListingAlias);
    });
    cy.get<string>('@secondListingAlias').then((secondListingAlias) => {
      cy.deactivateListing(secondListingAlias);
    });
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord does not opt-in to rental protection, turns on applications', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('firstListingAlias');
    });

    cy.get<string>('@firstListingAlias').then((firstListingAlias) => {
      cy.visit(getListingPageUrl(firstListingAlias));

      cy.intercept(
        `rental-manager/proxy/rental-manager-api/api/v1/users/properties/applicationsAccepted?propertyId=${firstListingAlias}&applicationsAccepted=true`,
      ).as('applicationsAccepted');
      cy.get('[data-testid="enable-applications-radio-yes"]').click();
      cy.wait('@applicationsAccepted');
    });

    cy.get('[data-test="StatusButton"]').click();
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('secondListingAlias');
      cy.wrap(listing.state).as('secondListingStateCode');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    // clicks on the Next button at the bottom of the form and moves forward to Product Intro Page
    cy.get<string>('@secondListingAlias').then((secondListingAlias) => {
      cy.visit(getListingPageUrl(secondListingAlias));
      cy.get('[data-test="StatusButton"]').should('have.text', 'Next');
      cy.get('[data-test="StatusButton"]').click();

      // should move to Publish screen and enable applications and publish
      cy.get('[data-test="cta-button-0"]').click();
      cy.get('[data-test="enable-applications"]').click();
      cy.get('[data-test="publish-listing-button"]').click();

      // landlord should have a published listing with applications enabled
      cy.payAndPublishListing();
      cy.get('[data-testid="enable-applications-radio-yes"]').scrollIntoView().should('be.checked');

      // Rental Protection should not be enabled
      cy.getDetails(secondListingAlias);
      cy.get('@isRentGuaranteeEnabled').should('be.equal', false);

      // landlord should see the opt-in banner on the SoH page
      cy.visit(getFindTenantPageUrl(secondListingAlias));
      cy.get('[data-test="rental-protection-banner"]').should('be.visible');
    });
  });
});
