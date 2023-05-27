describe('account creation', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    // before each test, we can automatically preserve the
    // 'loginmemento' cookies. this means they
    // will not be cleared before the NEXT test starts.
    //
    // the name of your cookies will likely be different
    // this is an example
    Cypress.Cookies.preserveOnce('loginmemento');
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('should create a user and listing', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing();
  });
});
