import { getLandlordLeasesOnboardingUrl } from '../../../support/leases/paths';

describe('landlord opt-in, application received, eligibility not approved, upload signed lease', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received, application eligibility not reviewed, upload signed lease', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: false });

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

    cy.get('[data-test="section-modal"]').contains(
      "You won't be able to purchase Rental Protection with this tenant on the lease until you review their income documents and mark their eligibility.",
    );

    cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

    cy.get('section').contains('You haven‘t marked this applicant‘s eligibility for Rental Protection');
  });
});
