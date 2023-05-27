import { getLandlordLeasesOnboardingUrl } from './../../../support/leases/paths';
describe('landlord opt-in, application received, eligibility not approved, upload signed lease', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received, application ineligible, upload signed lease', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: true, isIncomeToRentEligible: false });

    // go to leases onboarding
    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.visit(getLandlordLeasesOnboardingUrl(listingAlias));
    });

    cy.get('[data-test="upload-lease"]').click();

    cy.get('[data-test="upload-your-signed-lease-btn"').click();
    cy.uploadLeaseDocument();

    cy.intercept('/rental-manager/leasing/proxy/rental-manager-api/api/v1/users/leasing/getLeaseStatus').as(
      'getLeaseStatus',
    );
    cy.wait('@getLeaseStatus');

    cy.get('button').contains('Continue').click();

    cy.selectLeaseTerm();

    // select a tenant
    cy.get('[data-test="section-modal"]').find('[data-test="add-another"]').click();
    cy.get('[data-test="section-modal"]').find('[data-test="select-a-tenant-dropdown-btn"]').click();
    cy.selectTenantFromExperianProfile();

    // remove 1st tenant. bug?
    cy.get('[data-test="section-modal"]').find('[data-test="remove-person"][data-index="0"]').click();

    // Verify that the "You marked the selected tenant ineligible for Rental Protection" exists
    cy.get('[data-test="section-modal"]').contains('You marked the selected tenant ineligible for Rental Protection');

    cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

    // Verify that the "Ineligible applicant" modal exists
    cy.get('section').contains('You marked this applicant ineligible for Rental Protection');
  });
});
