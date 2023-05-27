import { getLandlordLeasesOnboardingUrl } from './../../../support/leases/paths';
import { getManagePolicyPageUrl } from '../../../support/listings/paths';

describe('landlord opt-in, application received, eligibility approved, self-upload lease created, ratified', () => {
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
    cy.getUserZuid().then((zuid) => {
      cy.task('log', `zuid: ${zuid}`);
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: true, isIncomeToRentEligible: true });

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(getLandlordLeasesOnboardingUrl(listingAlias));
    });

    cy.get('[data-test="upload-lease"]').click();

    cy.get('[data-test="go-to-uploading-lease-btn"').click();
    cy.uploadLeaseDocument();

    cy.intercept('/rental-manager/leasing/proxy/rental-manager-api/api/v1/users/leasing/getLeaseStatus').as(
      'getLeaseStatus',
    );
    cy.wait('@getLeaseStatus').then(({ request }) => {
      cy.task('log', `lease id: ${JSON.stringify(request.body, null, 2)}`);
      cy.wrap(request.body.leaseId).as('leaseId');
    });

    cy.get('button').contains('Continue').click();

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

    cy.get<number>('@leaseId').then((leaseId) => {
      cy.forceLeaseIntoSigningCompleteState(leaseId);
    });

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(getManagePolicyPageUrl(listingAlias));
    });

    cy.get('[data-testid="pending-step-title-2"]').should('have.text', '3. Upload or create a lease');
    cy.get('[data-testid="pending-step-check-completed-2"]').should('be.visible');
  });
});
