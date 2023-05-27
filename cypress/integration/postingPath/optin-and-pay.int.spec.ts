import 'cypress-iframe';
import { getFindTenantPageUrl, getListingPageUrl } from '../../support/listings/paths';

describe('landlord opting in and paying for listing to be published', () => {
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

  it('landlord opting in and paying for listing to be published', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('firstListingAlias');
    });

    cy.get<string>('@firstListingAlias').then((firstListingAlias) => {
      cy.visit(getListingPageUrl(firstListingAlias));

      cy.intercept(
        `rental-manager/proxy/rental-manager-api/api/v1/users/properties/applicationsAccepted?propertyId=${firstListingAlias}&applicationsAccepted=true`,
      ).as('applicationsAccepted');

      cy.get('[data-testid="enable-applications-radio-yes"]').scrollIntoView().click();

      cy.wait('@applicationsAccepted');

      cy.get('[data-test="StatusButton"]').click();
    });

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

      // opt in to rental protection
      cy.optInToRentalProtection();

      // should choose payment option and enter credit card information and pay for listing
      cy.get('[data-test="publish-listing-button"]').click();

      cy.payAndPublishListing();

      cy.confirmRentalProtectionPageWillLoad(secondListingAlias);

      cy.visit(getFindTenantPageUrl(secondListingAlias));

      cy.get('[data-test="rental-protection-banner"]').click();

      // landlord should see Manage Policy checklist with step 1 complete
      cy.get('[data-test="policy-module-step-item-check-circle-0"]').should('be.visible');

      // validate security deposit matches amount entered in opt-in flow
      cy.get('[data-test="security-deposit"]').should('have.text', '$1,500.00');

      // deactivate listing
      cy.get('[data-testid="breadcrumb-close-button"]').click();
      cy.get('[data-testid="deactivate-button"]').click();
      cy.get('[data-testid="deactivate-now-radio-button"]').scrollIntoView().click();
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-test="modal-close-button"]').click();

      // validate Manage Policy checklist is still visible with step 1 complete
      cy.get('[data-test="rental-protection-banner"]').click();
      cy.get('[data-test="policy-module-step-item-check-circle-0"]').should('be.visible');
    });
  });
});
