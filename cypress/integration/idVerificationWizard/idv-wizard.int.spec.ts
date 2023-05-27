import 'cypress-iframe';
import { getFindTenantPageUrl } from '../../support/listings/paths';

describe('start idv wizard and exit', () => {
    const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
    const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

    beforeEach(() => {
        cy.preTestScript();
    });

    after(() => {
        cy.postTestScript({ landlordEmail, renterEmail });
      });

    it('complete idv wizard', () => {
        cy.createUserByEmail(landlordEmail);
        cy.createListing().then((listing) => {
            cy.wrap(listing.listingAlias).as('listingAlias');
        });
        cy.forceEnrollUserIntoRentalProtectionExperiment();
        cy.completeApplication({
            landlordEmail,
            renterEmail,
            shouldUploadIncomeDocs: false,
            shouldVerifyIncomeDocs: false,
            isIncomeToRentEligible: false,
            shouldIdVerifyLandlord: false,
            shouldMarkLandlordTermsAndConditions: false,
        });

        cy.get<string>('@listingAlias').then((listingAlias) => {
            cy.applicationsAccepted(listingAlias);
            cy.visit(getFindTenantPageUrl(listingAlias));

            // should see an application
            cy.get('[data-testid="application-item"]').should('be.visible');
            cy.get('[data-testid="application-item"]').scrollIntoView().click();

            // go to IDV Wizard
            cy.get('[data-testid="verify-identity-button"]').should('be.visible');
            cy.get('[data-testid="verify-identity-button"]').click();

            // accept IDV wizard terms
            cy.get('[data-testid="wizard-id-verification-term-0"]', { timeout: 10000 }).click();
            cy.get('[data-testid="wizard-id-verification-term-1"]').scrollIntoView().click();
            cy.get('[data-testid="submit-button"]').click();
            cy.get('[data-testid="wizard-id-verification-term-2"]').scrollIntoView().click();
            cy.get('[data-testid="submit-button"]').click();
            cy.get('[data-testid="wizard-id-verification-term-3"]').scrollIntoView().click();
            cy.get('[data-testid="submit-button"]').click();
            // cy.get('[data-testid="wizard-id-verification-term-4"]').scrollIntoView().click();
            // cy.get('[data-testid="submit-button"]').click();
            cy.get('[data-test="next-button"]').click();

            // fill out Legal Name formfields
            cy.get('[data-testid="wizard-id-verification-first-name-input"]').type('anabel');
            cy.get('[data-testid="wizard-id-verification-last-name-input"]').type('whalen');
            cy.get('[data-test="next-button"]').click();

            // fill out Address formfields
            cy.get('[data-testid="wizard-id-verification-street-input"]').type('1461 Lake Christopher Dr');
            cy.get('[data-testid="wizard-id-verification-city-input"]').type('Virginia Beach');
            cy.get('[data-testid="wizard-id-verification-state-input"]').select('VA');
            cy.get('[data-testid="wizard-id-verification-zip-input"]').type('234647307');
            cy.get('[data-test="next-button"]').click();

            // fill out SSN formfield
            cy.get('[data-testid="wizard-id-verification-ssn-input"]').type('666-60-4389');
            cy.get('[data-test="next-button"]').click();

            // answer verification questions
            cy.get('[data-test="next-button"]').click();
            cy.get('[data-testid="wizard-id-verification-question-1"]').eq(4).check();
            cy.get('[data-testid="wizard-id-verification-question-2"]').eq(4).check();
            cy.get('[data-testid="wizard-id-verification-question-3"]').eq(4).check();
            cy.get('[data-testid="wizard-id-verification-question-4"]').eq(4).check();
            cy.get("body").then($body => {
                if ($body.text().includes("VIRGO")) {
                    cy.contains('VIRGO').click();
                }
                if ($body.text().includes("1974")) {
                    cy.contains('1974').click();
                }
            });

            cy.get('[data-test="next-button"]').click();

            // complete id-verification
            cy.get('[data-testid="wizard-id-verification-success-return"]').click();
            cy.get('[data-testid="PropertiesPage"]', { timeout: 30000 }).should('be.visible');
        });
    });
});
