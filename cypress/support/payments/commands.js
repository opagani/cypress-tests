const { getLandlordPaymentsOnboardingUrl } = require('./paths');
const EXPERIAN_PROFILES = require('../applications/experianProfiles');

Cypress.Commands.add('onboardToPayments', () => {
	cy.task('log', `Payments onboarding STARTED`);

	cy.get('@listingId').then((listingId) => {
		cy.visit(getLandlordPaymentsOnboardingUrl(listingId));
	});
	// Start payment onboarding
	cy.get('[data-auto-test-id="landlord-onboard-landing-page"] button').click();
	cy.contains('button', 'Ok, got it').click();

	const anabel = EXPERIAN_PROFILES[0];
	const anabelFullName = `${anabel.firstName} ${anabel.lastName}`;

	// Select the lease you're setting up payments for
	cy.contains('#landlord-lease-selector .Radio-label', anabelFullName).click();
	cy.contains('button', 'Continue').click();

	// How much is the monthly rent?
	cy.contains('.Text', 'How much is the monthly rent?').should('be.visible');
	cy.contains('button', 'Continue').click();

	// When should your tenant send their rent each month?
	cy.contains('.Text', 'When should your tenant send their rent each month?').should('be.visible');
	cy.contains('button', 'Continue').click();

	// How long will you be collecting rent?
	cy.contains('.Text', 'How long will you be collecting rent?').should('be.visible');
	cy.contains('button', 'Continue').click();

	// Confirm security deposit amount
	cy.contains('.Text', 'Confirm security deposit amount').should('be.visible');
	cy.get('[data-test="SecurityDepositContinue"]').click();

	// Would you like to collect prorated rent?
	cy.contains('.Text', 'Would you like to collect prorated rent?').should('be.visible');
	cy.get('button').contains('No').click();

	// Would you like to collect any other move-in costs?
	cy.contains('.Text', 'Would you like to collect any other move-in costs?').should('be.visible');
	cy.get('button').contains('No').click();


	// Who will send you payments?
	cy.contains('button', 'Continue').click();

	cy.contains('.Text', 'Verify your tax information').should('be.visible');
	cy.contains('.Text', 'An individual').click()
	cy.contains('button', 'Continue').click();

	cy.task('log', `Payments Identity Verification STARTED`);

	// https://zillowgroup.slack.com/archives/C021V6H022D/p1679333820559909
	// dob=1-1-1902 and ssn=0000000000 needed for stipe id verification
	// Verify your identity
	cy.get('[data-statekey="monthOfBirth"]').select(Number(1));
	cy.get('[data-statekey="dayOfBirth"]').type(1);
	cy.get('[data-statekey="yearOfBirth"]').type(1902);

	cy.get('[data-statekey="fullSocialSecurityNumber"]').type('0000000000');

	// /createFakeListing sometimes applies a phone number that is not valid for the payment /verified endpoint
	// the phone number is updated here to make sure that it is always valid
	// https://zillowgroup.slack.com/archives/CHGTFCSEA/p1646419560443759
	cy.get('[data-statekey="phoneNumber"]').clear().type(8773138601);

	cy.contains('button', 'Continue').click();

	cy.contains('.Text', 'Verify your phone number').should('be.visible');
	cy.contains('button', 'Continue').click();
	cy.get('[data-digit="1"]').type('0', { force: true });
	cy.get('[data-digit="2"]').type('0', { force: true });
	cy.get('[data-digit="3"]').type('0', { force: true });
	cy.get('[data-digit="4"]').type('0', { force: true });
	cy.get('[data-digit="5"]').type('0', { force: true });

	cy.contains('button', 'Submit').click();

	cy.task('log', `Payments Identity Verification FINISHED`);

	// Where would you like rent to be deposited?
	cy.contains('.Text', 'Where would you like rent to be deposited?').should('be.visible');
	cy.get('[data-trackingaction="manualDeposit"]').click();
	cy.get('[data-statekey="routingNumber"]').type('110000000');
	cy.get('[data-statekey="checkingAccountNumber"]').type('000123456789');
	cy.get('[data-statekey="confirmAccountNumber"]').type('000123456789');
	cy.get('[data-test="landlord-account-info-link-checking-account"]').click();

	cy.contains('button', 'Confirm and invite tenant').click();

	cy.task('log', `Payments onboarding FINISHED`);
});

Cypress.Commands.add('completePaymentsOnboardingAndCoverageRequest', () => {
	cy.task('log', `completePaymentsOnboardingAndCoverageRequest STARTED`);

	cy.onboardToPayments();

	cy.contains('#landlord-post-confirmation', 'Payments successfully set up');
	cy.contains('#landlord-post-confirmation',
		'Next, you need to finalize and approve your Rental Protection coverage request');

	cy.contains('button', 'Continue').click();

	cy.task('log', `Request for coverage document signing STARTED`);

	cy.contains('#landlord-coveragerequest-viewer', 'Sign the request for coverage');
	cy.contains('#landlord-coveragerequest-viewer button', 'Continue').click();
	cy.contains('#landlord-address-verification button', 'Confirm').click();

	const charles = EXPERIAN_PROFILES[3];
	const charlesFullName = `${charles.firstName} ${charles.lastName}`;
	cy.enter('iframe[src*="zillowdocs.com"]').then((getBody) => {
		getBody().find('#document-panel-scroll-container').scrollTo('bottom');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(1000);
		getBody().find('#start-signing').click({ force: true });

		getBody().find('input[type="checkbox"]').check({ force: true });
		getBody().find('button[id="nextField"]').eq(1).click({ force: true });
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.wait(1000);
		getBody().find('input[type="checkbox"]').check({ force: true });

		getBody().contains('button', 'Sign here').click({ force: true });
		getBody().find('#primary-modal-action').click({ force: true });
		getBody().find('div[id*="field-40"] div[role="textbox"]').type(charlesFullName, { force: true });
		getBody().find('#finish-signing').click({ force: true });
	});

	cy.task('log', `Request for coverage document signing FINISHED`);

	cy.contains('button', 'Continue').click();
	cy.contains('#landlord-coveragerequestsubmitted-viewer', 'Your request for coverage has been sent');

	cy.task('log', `completePaymentsOnboardingAndCoverageRequest FINISHED`);
});

Cypress.Commands.add('completePaymentsOnboardingButCancelSigningCoverageRequest', () => {
	cy.onboardToPayments();

	cy.contains('#landlord-post-confirmation', 'Payments successfully set up');
	cy.contains('#landlord-post-confirmation',
		'Next, you need to finalize and approve your Rental Protection coverage request');

	cy.contains('button', 'Continue').click();
	cy.contains('#landlord-coveragerequest-viewer', 'Sign the request for coverage');
	cy.get('#landlord-coveragerequest-viewer .Modal-close').click();

	cy.contains('#landlord-rental-protection-exit-payment_setup', 'Exit signing Rental Protection request?');
	cy.contains('button.Button-primary', 'Yes, exit').click();

	cy.contains('.Text.RentalProtection-warning', 'Document not signed');
});
