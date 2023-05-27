import { getManagePolicyPageUrl } from '../../../support/listings/paths';

describe('landlord opt-in, application completed, wizard lease created, out for signing', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord opt-in, application received, eligibility approved, upload signed lease', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.completeSenseOfHomeBannerOptin();
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: true, isIncomeToRentEligible: true });
    cy.createLeaseWithWizard();

    cy.url().then((url) => {
      // ex lease url https://www.qa.zillow.net/rental-manager/leasing/property/2cnxt7pjesyz0/lease/725/list/preview
      const splitUrl = url.split('/');
      const leaseIndex = splitUrl.indexOf('lease');
      const leaseId = splitUrl[leaseIndex + 1];
      cy.task('log', `lease id: ${leaseId}`);
      cy.wrap(Number(leaseId)).as('leaseId');
    });

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
