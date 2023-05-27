Cypress.Commands.add('postTestScript', ({ landlordEmail, renterEmail }) => {
  cy.task('log', `Landlord email: ${landlordEmail}`);
  cy.task('log', `Renter email: ${renterEmail}`);
});

Cypress.Commands.add('preTestScript', () => {
  Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
  });
  Cypress.Cookies.preserveOnce(
    'dev_brand',
    'loginmemento',
    'ZILLOW_SSID',
    'ZILLOW_SID',
  );
})
