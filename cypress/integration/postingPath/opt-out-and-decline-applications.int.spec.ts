describe('landlord does not opt-in to rental protection, does not publish listing', () => {
    const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
    const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

    const LISTING_RM_ROOT = 'rental-manager';

    before('create user, listing, and opt-in into rental protection', () => {
        cy.createUserByEmail(landlordEmail);
        cy.createListing().then((listing) => {
            cy.wrap(listing.listingAlias).as('listingAlias');
            cy.wrap(listing.state).as('listingStateCode');
        });
        cy.forceEnrollUserIntoRentalProtectionExperiment();
        cy.forceEnrollUserIntoModularListingRentalProtectionExperiment();
    });

    beforeEach(() => {
        cy.preTestScript();
    });

    after(() => {
        cy.get<string>('@listingAlias').then((listingAlias) => {
            cy.deactivateListing(listingAlias);
        });
        cy.postTestScript({ landlordEmail, renterEmail });
    });

    it('landlord does not opt-in to rental protection, declines applications, and publishes listing', () => {
        cy.get('@listingAlias').then((listingAlias) => {
            cy.visit(`${LISTING_RM_ROOT}/properties/${listingAlias}/create-listing`);
        });

        // clicks on the Next button at the bottom of the form and moves forward until ready to publish listing
        for (let i = 1; i < 21; i++) {
            cy.get("body").then($body => {
                if ($body.find('[data-test="ApplicationsFormField"]').length < 1) {
                    cy.get('[data-test="next-button"]').click();
                }
            })
        }

        // decline applications
        cy.get('[data-testid="decline-applications-checkbox"]').click();
        cy.get('[data-test="next-button"]').click();
        cy.reload();
        cy.get('[data-test="next-button"]').click();
        cy.get('[data-test="next-button"]').click();


        // publish listing
        cy.payAndPublishListing();

        // verify SoH page should show banner to enroll
        cy.get('@listingAlias').then((listingAlias) => {
            cy.visit(`${LISTING_RM_ROOT}/properties/${listingAlias}/find-tenants`);
        });
        cy.get('[data-test="rental-protection-banner"]', { timeout: 10000 }).should('be.visible');
    });
});
