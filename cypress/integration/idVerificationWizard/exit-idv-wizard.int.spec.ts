import 'cypress-iframe';
import { getFindTenantPageUrl } from '../../support/listings/paths';

describe('start idv wizard and exit', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('start idv wizard and exit', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();
    cy.completeApplication({
      landlordEmail,
      renterEmail,
      shouldUploadIncomeDocs: false,
      shouldVerifyIncomeDocs: false,
      isIncomeToRentEligible: false,
      shouldIdVerifyLandlord: false,
      shouldMarkLandlordTermsAndConditions: false,
    });

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.applicationsAccepted(listingAlias);
      cy.visit(getFindTenantPageUrl(listingAlias));

      // should see an application
      cy.get('[data-testid="application-item"]').should('be.visible');
      cy.get('[data-testid="application-item"]').scrollIntoView().click();

      // go to IDV Wizard
      cy.get('[data-testid="verify-identity-button"]').should('be.visible');
      cy.get('[data-testid="verify-identity-button"]').click();

      // accept IDV wizard terms
      cy.get('[data-testid="wizard-id-verification-term-0"]', { timeout: 10000 }).click();
      cy.get('[data-testid="wizard-id-verification-term-1"]').scrollIntoView().click();
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-testid="wizard-id-verification-term-2"]').scrollIntoView().click();
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-testid="wizard-id-verification-term-3"]').scrollIntoView().click();
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-testid="wizard-id-verification-term-4"]').scrollIntoView().click();
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-test="next-button"]').click();

      // fill out Legal Name formfields
      cy.get('[data-testid="wizard-id-verification-first-name-input"]').type('joshua');
      cy.get('[data-testid="wizard-id-verification-middle-name-input"]').type('cali');
      cy.get('[data-testid="wizard-id-verification-last-name-input"]').type('liang');
      cy.get('[data-test="next-button"]').click();

      // should see address formfield
      cy.get('[data-testid="wizard-id-verification-street-input"]').should('be.visible');

      // should exit IDV Wizard
      cy.get('[data-test="desktop-exit-button"]').click();
      cy.get('[data-test="submit-button"]').click();
      cy.get('[data-testid="TenantsPage"]').should('be.visible');
    });
  });
});
