const { format, add, setDate, lastDayOfMonth, isFirstDayOfMonth } = require('date-fns');
const { uploadPDF } = require('../utils/uploadDocument');
const EXPERIAN_PROFILES = require('../applications/experianProfiles');
const { getLandlordLeasesOnboardingUrl, FORCE_LEASE_INTO_SIGNING_COMPLETE_STATE, getLandlordCreateLeaseUrl } = require('../leases/paths');
const { LEASE_START_DATE, LEASE_END_DATE } = require('../../constants/CYPRESS_ENV_VARS');

Cypress.Commands.add('uploadLeaseDocument', () => {
  cy.task('log', 'Uploading lease document');
  uploadPDF('documents/Residential-Lease-Agreement.pdf');
  cy.task('log', 'Confirming upload complete');
  cy.intercept('https://www.zillowdocs.com/api/v1/documents/actions/upload').as('zDocsUpload');
  cy.wait('@zDocsUpload');
});

Cypress.Commands.add('selectLeaseTerm', () => {
  cy.task('log', `Selecting lease term`);

  cy.get('[data-test="section-modal"]').find('li').contains('Fixed term').click({ force: true });
  const leaseStartDateParam = Cypress.env(LEASE_START_DATE);
  const leaseEndDateParam = Cypress.env(LEASE_END_DATE);
  const date = new Date();

  const setLeaseStartDate = (date) => {
    if (isFirstDayOfMonth(date)) {
      return setDate(date, 1);
    }

    return setDate(add(date, { months: 1 }), 1);
  }

  // setDate(add(date, { months: 1 }), 1) === set date to first day of next month
  const leaseStartDate = leaseStartDateParam ? new Date(leaseStartDateParam) : setLeaseStartDate(date);
  const leaseEndDate = leaseEndDateParam ? new Date(leaseEndDateParam) : lastDayOfMonth(add(date, { years: 1, months: 1 }));

  const formattedLeaseStartDate = format(leaseStartDate, 'LLLL d, yyyy');
  const formattedleaseEndDate = format(leaseEndDate, 'LLLL d, yyyy');

  cy.get('[data-test="section-modal"]').find('input[placeholder="Select date"]').eq(0).type(formattedLeaseStartDate);
  cy.get('[data-test="section-modal"]')
    .find('input[placeholder="Select date"]')
    .eq(1)
    .type(formattedleaseEndDate, { force: true });
  cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

  cy.task('log', `Lease term selected successfully`);
});

Cypress.Commands.add('forceLeaseIntoSigningCompleteState', (leaseId) => {
  cy.request({
    method: 'GET',
    url: FORCE_LEASE_INTO_SIGNING_COMPLETE_STATE,
    qs: {
      leaseId,
      apiKey: 'changeit',
    },
  }).as('forceLeaseIntoSigningCompleteState');

  cy.get('@forceLeaseIntoSigningCompleteState').then((response) => {
    cy.task('log', JSON.stringify(response, null, 2));
    assert.equal(response.status, 200);
    return;
  });
});

Cypress.Commands.add('selectTenantFromExperianProfile', () => {
  cy.task('log', `Selecting tenant for lease...`);

  const anabel = EXPERIAN_PROFILES[0];
  cy.get('section[role="menu"]').find('button').contains(anabel.firstName).click();

  cy.task('log', `Tenant selected for lease successfully`);
});

Cypress.Commands.add('fillInLeaseSummary', () => {
  cy.task('log', `Filling in lease summary...`);

  const thomas = EXPERIAN_PROFILES[1];

  cy.intercept(
    '/rental-manager/leasing/proxy/rental-manager-api/api/v1/users/leasing/getLeaseStatusForNextNode',
  ).as('getLeaseStatusForNextNode1');

  cy.get('[data-test="section-modal"]').find('[aria-labelledby="landlord-first-name"]').type(thomas.firstName);
  cy.get('[data-test="section-modal"]').find('[aria-labelledby="landlord-last-name"]').type(thomas.lastName);

  cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

  cy.wait('@getLeaseStatusForNextNode1');

  // Confirm rent amount
  cy.intercept(
    '/rental-manager/leasing/proxy/rental-manager-api/api/v1/users/leasing/getLeaseStatusForNextNode',
  ).as('getLeaseStatusForNextNode2');

  cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

  cy.wait('@getLeaseStatusForNextNode2');

  // Confirm security deposit amount
  cy.get('[data-test="section-modal"]')
    .contains('label', 'Security deposit')
    .invoke('attr', 'for')
    .then((id) => {
      // note that the last Cypress command inside the `cy.then`
      // changes the yielded subject to its result
      cy.get(`input#${id}`).as('leasingSecurityDepositInput');
    })
    .invoke('val')
    .then((value) => {
      if (!value) {
        cy.get('@leasingSecurityDepositInput').type(1500, { force: true });
      }
    });
  cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

  cy.task('log', `Lease summary filled in successfully`);
});

Cypress.Commands.add('completeUploadSignedLease', () => {
  cy.task('log', `completeUploadSignedLease STARTED`);

  cy.get('@listingAlias').then((listingAlias) => {
    cy.visit(getLandlordCreateLeaseUrl(listingAlias));
  });

  cy.get('ul[class*="StyledListbox"').find('li').contains('Store your signed lease').click({ force: true });
  cy.get('button').contains('Continue').click();

  cy.uploadLeaseDocument();

  cy.intercept('/rental-manager/leasing/proxy/rental-manager-api/api/v1/users/leasing/getLease*').as(
    'getLease',
  );
  cy.wait('@getLease').then(({ request }) => {
    const getLeaseURL = new URL(request.url)
    cy.task('log', `lease id: ${JSON.stringify(getLeaseURL.searchParams.get('leaseId'), null, 2)}`);
    cy.wrap(getLeaseURL.searchParams.get('leaseId')).as('leaseId');
  });

  cy.get('button').contains('Continue').click();

  // select lease term
  cy.selectLeaseTerm();

  // select a tenant
  cy.get('[data-test="section-modal"]').find('[data-test="select-a-tenant-dropdown-btn"]').click();
  cy.selectTenantFromExperianProfile();

  cy.get('[data-test="section-modal"]').find('[data-test="submit"]').click();

  cy.fillInLeaseSummary();

  cy.contains('button', 'Finalize lease').click();
  cy.contains('button', 'Go to payments').should('exist');

  cy.task('log', `completeUploadSignedLease FINISHED`);
});

Cypress.Commands.add('createLeaseWithWizard', () => {
  cy.get('@listingAlias').then((listingAlias) => {
    cy.visit(getLandlordLeasesOnboardingUrl(listingAlias));
  });

  // go to lease creation
  cy.contains('h4', 'Create and sign leases online—for free!');
  cy.get('[data-test="create-new-lease"]').click();

  cy.contains('h4', 'How Zillow Leases work');
  cy.get('[data-test="create-lease"').click();

  cy.createLeaseWithWizardPart1();
  cy.createLeaseWithWizardPart2();
  cy.createLeaseWithWizardPart3();
  cy.createLeaseWithWizardPart4();
  cy.createLeaseWithWizardPart5();

  // review your answers
  cy.contains('h4', 'Review your answers');
  cy.contains('button', 'Preview full lease').click();

  // preview lease
  cy.iframe('iframe[src*="zillowdocs.com"]').find('div#document-panel-scroll-container').should('exist');
  cy.contains('button', 'Request signatures').click();

  // request signatures
  cy.get('div[data-test="children-container"]').find('input[type="checkbox"]').eq(1).check({ force: true });
  cy.get('[data-test="send-for-signatures"]').click();
});

const getElementForLabel = (parentSelector, label) => {
  return cy
    .get(parentSelector)
    .contains('label', label)
    .invoke('attr', 'for')
    .then((id) => {
      // note that the last Cypress command inside the `cy.then`
      // changes the yielded subject to its result
      cy.get(`input#${id}`);
    });
};

Cypress.Commands.add('createLeaseWithWizardPart1', () => {
  // Wizard Part 1:  Parties to the lease
  cy.contains('h5', 'Parties to the lease');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // fill out landlord information
  cy.contains('p', 'Who is the landlord?');
  const thomas = EXPERIAN_PROFILES[1];

  getElementForLabel('.section-wrapper', 'First name').type(thomas.firstName);
  getElementForLabel('.section-wrapper', 'Last name').type(thomas.lastName);
  getElementForLabel('.section-wrapper', 'Phone number').type(6760303030);

  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  cy.contains('p', 'Does the property have a managing agent, such as a property manager?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().trigger('click');

  // select a tenant
  cy.contains('h6', 'Tell us about your tenants');
  cy.get('.section-wrapper').find('[data-test="select-a-tenant-dropdown-btn"]').click();
  cy.selectTenantFromExperianProfile();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  cy.contains('label', 'Will there be any additional occupants?');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();
});

Cypress.Commands.add('createLeaseWithWizardPart2', () => {
  // Wizard Part 2:  Property and amenities
  cy.contains('h5', 'Property and amenities');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // select single family home
  cy.get('.section-wrapper button').first().click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // go to property address and make sure the address is not empty
  cy.contains('h6', 'What is the property’s address?');
  getElementForLabel('.section-wrapper', 'Street address').invoke('val').should('not.be.empty');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  cy.contains('label', 'Is the property part of a homeowners or condo association?');
  cy.get('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // select appliances, furniture and fixtures
  cy.contains('legend', 'What appliances, furniture and fixtures are included with your rental property?');
  cy.get('input#refrigerator').check({ force: true });
  cy.get('input#oven-range').check({ force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // select utilities and services
  cy.contains('legend', 'Utilities and services');
  cy.contains('p', 'Which utilities will be paid by the tenant in addition to base rent?');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // select more utilities and services
  cy.contains('legend', 'Utilities and services');
  // select natural gas
  cy.get('input#natural-gas').check({ force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();
  // select telephone/cable TV/internet
  cy.contains('p', 'Telephone/cable TV/internet');
  cy.contains('legend', 'Who will set up and pay for telephone?');
  // select tenant
  cy.get('input#telephoneTVInternet_telephone_tenantSetUpAndPay').check({ force: true });
  cy.get('input#telephoneTVInternet_cableTV_tenantSetUpAndPay').check({ force: true });
  cy.get('input#telephoneTVInternet_internet_tenantSetUpAndPay').check({ force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  cy.contains('p', 'Utilities and services payment timing');
  cy.contains('label', 'All variable utility costs will be billed monthly, and must be paid by tenant within');
  cy.get('input#AdornedInput-utilities-and-services-payment').type('5', { force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  cy.contains('p', 'Is extra storage space available?');
  cy.contains('button', 'No, none is available').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();
});

Cypress.Commands.add('createLeaseWithWizardPart3', () => {
  // Wizard Part 3:  Terms and payments
  cy.contains('h5', 'Terms and payments');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // select lease term
  cy.get('.section-wrapper').find('li').contains('Fixed term').click({ force: true });
  cy.get('.section-wrapper').find('input[placeholder="Select date"]').eq(0).type('January 1, 2030');
  cy.get('.section-wrapper').find('input[placeholder="Select date"]').eq(1).type('January 1, 2031', { force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // about the rent
  cy.contains('h6', 'Tell us about the rent');
  cy.get('input#AdornedInput-base-rent').invoke('val').should('not.be.empty');
  cy.get('input#firstPayOnSign').check({ force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // form of payment
  cy.contains('label', 'Which form(s) of payment will you accept?');
  cy.get('.section-wrapper').find('li').contains('Direct deposit').click({ force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // late rent
  cy.contains('label', 'When is rent considered late?');
  cy.get('.section-wrapper input').first().type('100', { force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // late fee charged
  cy.contains('label', 'Will you charge a fee if a payment gets reversed?');
  cy.get('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // grace period
  cy.contains('p', 'How long is the grace period before the tenant defaults on the lease?');
  cy.get('input#days-after-unpaid').type('10', { force: true });
  cy.get('input#days-after-receiving-notice').type('10', { force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // pro rated rent
  cy.contains('p', 'Will there be any prorated rent when the tenant moves in?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // collect rent on move in
  cy.contains('label', 'Will you collect the last month’s rent payment upfront?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // collect security deposit
  cy.contains('label', 'Will you collect a security deposit?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').first().click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // non refundable fees
  cy.contains('span', 'Will there be non-refundable fees?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();
});

Cypress.Commands.add('createLeaseWithWizardPart4', () => {
  // Wizard Part 4:  Rights and obligations
  cy.contains('h5', 'Rights and obligations');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // require renters insurance?
  cy.contains('p', 'Will you require tenants to obtain renters insurance?');
  cy.get('.section-wrapper').find('[data-test="yes-button"]').first().click();
  cy.get('input#input-minimum-coverage-amt').type('5000', { force: true });
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // agreed to do any work on the property before the tenant moves in?
  cy.contains('label', 'Have you agreed to do any work on the property before the tenant moves in?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // any restrictions apply to the property?
  cy.contains('label', 'Do any easements, covenants, conditions, or restrictions apply to the property?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // additional rules
  cy.contains('legend', 'Additional rules');
  cy.contains('p', 'Which rules would you like to include?');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();
});

Cypress.Commands.add('createLeaseWithWizardPart5', () => {
  // Wizard Part 5:  Additional details
  cy.contains('h5', 'Additional details');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // is smoking allowed?
  cy.contains('label', 'Is smoking allowed on the property?');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // Will tenants have pets on the property?
  cy.contains('label', 'Will tenants have pets on the property?');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // parking on the property?
  cy.contains('label', 'Will the tenant be parking on the property?');
  cy.contains('button', 'No, none is available').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // any lead-based paint on the property?
  cy.contains('label', 'Do you know of any lead-based paint on the property?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // Section 8 voucher?
  cy.contains('p', 'Will the tenant use a Housing Choice voucher (i.e., a Section 8 voucher)?');
  cy.get('.section-wrapper').find('[data-test="no-button"]').click();
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();

  // additional documents
  cy.contains('h6', 'Are there any additional documents to include with your lease?');
  cy.get('.section-wrapper').find('[data-test="submit"]').first().click();
});
