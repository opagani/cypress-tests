import { getFindTenantPageUrl } from '../../support/listings/paths';

describe('rental protection manage policy page, pending, completed step 1', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  before('create user, listing, and opt-in into rental protection', () => {
    cy.preTestScript();

    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();
    cy.setCookie('ZG_RENT_GUARANTEE_ENABLED', 'true');

    cy.completeSenseOfHomeBannerOptin();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.confirmRentalProtectionPageWillLoad(listingAlias);
      cy.visit(getFindTenantPageUrl(listingAlias));
    });
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('verify manage policy page, pending, step 1 completed', () => {
    // verify rental protection banner at SoH page
    cy.get('[data-test="rental-protection-banner"]').should('be.visible');
    cy.get('[data-test="rental-protection-banner"]').should(
      'contain.text',
      'Rental Protection request started through Zillow Insurance Services',
    );
    cy.get('[data-test="rental-protection-banner"]').should(
      'contain.text',
      'See your next steps to get up to $5k coverage',
    );
    cy.get('[data-test="rental-protection-banner"]').scrollIntoView().click();

    // verify manage rental protection page
    cy.get('[data-testid="page-title"]').should('have.text', 'Rental Protection');
    cy.get('[data-testid="page-description"]').should(
      'have.text',
      'You\'ve started your request for Rental Protection offered through Zillow Insurance Services. '
        + 'Rental Protection is lease insurance that offers landlords coverage for up to $5,000 of missed rent and '
        + 'property damage caused by tenants. The cost for Rental Protection is $45 per month plus any applicable '
        + 'state surplus lines taxes and fees.');

    // validate step Security Deposit
    cy.get('[data-testid="pending-step-title-0"]').should('have.text', '1. Select security deposit');
    // security deposit should match the amount entered in the opt-in flow
    cy.get('[data-testid="security-deposit"]').should('have.text', '$1,500.00');
    cy.get('[data-testid="security-deposit-cta"]').should('have.text', 'Change');
    cy.get('[data-testid="pending-step-check-completed-0"]').should('be.visible');

    // validate step Find Tenant
    cy.get('[data-testid="pending-step-title-1"]').should('have.text', '2. Find and secure an eligible tenant');
    cy.get('[data-testid="pending-step-description-1"]').should(
      'have.text',
      'Review income documents and verify the income.',
    );
    cy.get('[data-testid="pending-step-description-1"] a')
      .should('have.attr', 'href')
      .and('include', '/rental-manager/applications/?propertyId=');

    // validate step Lease
    cy.get('[data-testid="pending-step-title-2"]').should('have.text', '3. Upload or create a lease');
    cy.get('[data-testid="pending-step-description-2"]').should(
      'have.text',
      'After you accept an eligible tenant, create a lease.',
    );
    cy.get('[data-testid="pending-step-description-2"] a')
      .should('have.attr', 'href')
      .and('include', '/rental-manager/leasing/property/');

    // validate step Payment
    cy.get('[data-testid="pending-step-title-3"]').should('have.text', '4. Set up payments');
    cy.get('[data-testid="pending-step-description-3"]').should(
      'have.text',
      'Allow tenants to send payments directly to your bank account. Set up payments',
    );
    cy.get('[data-testid="pending-step-description-3"] a')
      .should('have.attr', 'href')
      .and('include', '/rental-manager/payments/properties/');

    // validate step Coverage Request
    cy.get('[data-testid="pending-step-title-4"]').should('have.text', '5. Sign coverage request');
    cy.get('[data-testid="pending-step-description-4"]').should(
      'have.text',
      'Allow Zillow Insurance Services to request Rental Protection. ',
    );

    // validate Drop Policy
    cy.get('button[data-testid="drop-policy-cta"]').should('have.text', 'Drop Rental Protection request');

    // validate Security Deposit modal
    cy.get('[data-testid="security-deposit-cta"]').scrollIntoView().click();
    cy.get('[data-testid="security-deposit-modal-header"]').should('be.visible');
    cy.get('[data-testid="security-deposit-modal-input"]')
      .should('be.visible')
      .and('have.attr', 'placeholder')
      .and('include', '1,500.00');
    cy.get('[data-test="modal-close-button"]').click();
    cy.get('[data-testid="security-deposit-modal-header"]').should('not.exist');
  });
});
