import { getFindTenantPageUrl } from '../../support/listings/paths';

describe('rental protection manage policy page, request sent, completed steps 1-2-3-4-5', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  before(
    'create user, listing, opt-in into rental protection, invite applicant, verify income, ' +
      'upload lease, onboard payments, sign coverage request',
    () => {
      cy.preTestScript();

      cy.createUserByEmail(landlordEmail);
      cy.createListing().then((listing) => {
        cy.wrap(listing.listingAlias).as('listingAlias');
        cy.wrap(listing.listingId).as('listingId');
      });
      cy.forceEnrollUserIntoRentalProtectionExperiment();
      cy.setCookie('ZG_RENT_GUARANTEE_ENABLED', 'true');

      cy.completeSenseOfHomeBannerOptin();

      cy.get<string>('@listingAlias').then((listingAlias) => {
        cy.confirmRentalProtectionPageWillLoad(listingAlias);
      });

      cy.completeApplication({
        landlordEmail,
        renterEmail,
        shouldVerifyIncomeDocs: true,
        isIncomeToRentEligible: true,
      });

      cy.completeUploadSignedLease();

      cy.completePaymentsOnboardingAndCoverageRequest();
      cy.get<string>('@listingAlias').then((listingAlias) => {
        // load SoH find tenants page
        cy.visit(getFindTenantPageUrl(listingAlias));
      });
    },
  );

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('verify manage policy page, coverage request sent, steps 1-2-3-4-5 completed', () => {
    // verify rental protection banner at SoH page
    cy.get('[data-test="rental-protection-banner"]').should('be.visible');
    cy.get('[data-test="rental-protection-banner"]').should(
      'contain.text',
      'Rental Protection requested through Zillow Insurance Services',
    );
    cy.get('[data-test="rental-protection-banner"]').should(
      'contain.text',
      'Your policy will go into effect after your first premium is processed.',
    );
    cy.get('[data-test="rental-protection-banner"]').scrollIntoView().click();

    // verify manage rental protection page
    cy.get('[data-testid="page-title"]').should('have.text', 'Rental Protection');
    cy.get('[data-testid="page-description"]').should(
      'have.text',
      'You started a request for Rental Protection through Zillow Insurance Services, providing up to $5,000 '
        + 'to help cover missed rent and property damage for $45 monthly premium.* The insurance coverage won\'t go '
        + 'into effect until your first premium payment is processed, after your tenant uses Zillow to make their '
        + 'first rent payment.');

    // validate step Security Deposit
    cy.get('[data-testid="pending-step-title-0"]').should('have.text', '1. Select security deposit');
    // security deposit should match the amount entered in the opt-in flow
    cy.get('[data-testid="security-deposit"]').should('have.text', '$1,500.00');
    cy.get('[data-testid="security-deposit-cta"]').should('not.exist');
    cy.get('[data-testid="pending-step-check-completed-0"]').should('be.visible');

    // validate step Find Tenant
    cy.get('[data-testid="pending-step-title-1"]').should('have.text', '2. Find and secure an eligible tenant');
    cy.get('[data-testid="pending-step-description-1"]')
      .should('have.text', 'anabel whalen')
      .and('not.have.attr', 'href');
    cy.get('[data-testid="pending-step-check-completed-1"]').should('be.visible');

    // validate step Lease
    cy.get('[data-testid="pending-step-title-2"]').should('have.text', '3. Upload or create a lease');
    cy.get('[data-testid="pending-step-description-2"]')
      .should('have.text', 'anabel whalen’s Lease')
      .and('not.have.attr', 'href');
    cy.get('[data-testid="pending-step-description-2"] a').should('not.exist');
    cy.get('[data-testid="pending-step-check-completed-2"]').should('be.visible');

    // validate step Payment
    cy.get('[data-testid="pending-step-title-3"]').should('have.text', '4. Set up payments');
    cy.get('[data-testid="pending-step-description-3"]')
      .should('have.text', "You're set up to receive payments.")
      .and('not.have.attr', 'href');
    cy.get('[data-testid="pending-step-check-completed-3"]').should('be.visible');

    // validate step Coverage Request
    cy.get('[data-testid="pending-step-title-4"]').should('have.text', '5. Sign coverage request');
    cy.get('[data-testid="pending-step-description-4"]').should(
      'have.text',
      'Allow Zillow Insurance Services to request Rental Protection. ',
    );
    cy.get('[data-testid="pending-step-check-completed-4"]').should('be.visible');

    // validate Drop Policy
    cy.get('button[data-testid="drop-policy-cta"]')
      .should('have.text', 'Drop Rental Protection request')
      .and('be.disabled');
  });
});
