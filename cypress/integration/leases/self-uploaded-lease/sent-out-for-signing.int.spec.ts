import { getLandlordLeasesOnboardingUrl } from './../../../support/leases/paths';
describe('landlord opt-in, application received, eligibility approved, self-upload lease created, sent out for signing', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received, eligibility approved, self-upload lease created, sent out for signing', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: true, isIncomeToRentEligible: true });

    // go to leases onboarding
    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(getLandlordLeasesOnboardingUrl(listingAlias));
    });

    cy.get('[data-test="upload-lease"]').click();

    // enable signed self upload
    // cy.get('#adminWidgetFeatureSelector').select('enableSignedSelfUpload');

    cy.get('[data-test="go-to-uploading-lease-btn"').click();
    cy.uploadLeaseDocument();

    cy.intercept('/rental-manager/leasing/proxy/rental-manager-api/api/v1/users/leasing/getLeaseStatus').as(
      'getLeaseStatus',
    );
    cy.wait('@getLeaseStatus');

    cy.get('button').contains('Continue').click();

    // select lease term
    cy.selectLeaseTerm();

    // select a tenant
    cy.get('[data-test="section-modal"]').find('[data-test="add-another"]').click();
    cy.get('[data-test="section-modal"]').find('[data-test="select-a-tenant-dropdown-btn"]').click();
    cy.selectTenantFromExperianProfile();

    // remove 1st tenant. bug?
    cy.get('[data-test="section-modal"]').find('[data-test="remove-person"][data-index="0"]').click();

    cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

    cy.fillInLeaseSummary();

    cy.get('[data-test="primary-cta"]').contains('Next');
    cy.get('[data-test="primary-cta"]').first().click();
  });
});
