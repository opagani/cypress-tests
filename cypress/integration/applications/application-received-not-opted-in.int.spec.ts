describe('landlord NOT opted-in, application received', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord NOT opted-in, application received', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.get<string>('@listingAlias').then((listingAlias) => {
      cy.applicationsAccepted(listingAlias);
    });
    cy.completeApplication({ landlordEmail, renterEmail, shouldVerifyIncomeDocs: false });
  });
});
