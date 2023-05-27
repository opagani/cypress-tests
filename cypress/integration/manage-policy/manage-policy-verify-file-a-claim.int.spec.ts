
describe('rental protection manage policy page, verify the file a claim CTA on an effective policy', () => {
    const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
    const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;
  
    before(() => {
      cy.preTestScript();
    });
  
    after(() => {
      cy.postTestScript({ landlordEmail, renterEmail });
    });
  
    it('rental protection manage policy page, effective policy and file a claim', () => {
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
        cy.forcePolicyIntoEffectiveStatus(listingAlias);
        cy.verifyPolicyIsEffective(listingAlias);
      });
          
      //verify how to file a claim CTA exists
      cy.get('[data-test="managePolicy-fileClaim"]').should('be.visible').click();
      cy.get('[data-testid="submit-button"]').should('be.visible');
    });
  });
  