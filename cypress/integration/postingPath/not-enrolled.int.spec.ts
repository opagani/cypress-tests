import { getFindTenantPageUrl } from '../../support/listings/paths';

describe('landlord should not be enrolled in RP', () => {
  const landlordEmail = `rent_guarantee_test_landlord_${Date.now()}@gmail.com`;
  const renterEmail = `rent_guarantee_test_renter_${Date.now()}@gmail.com`;

  beforeEach(() => {
    cy.preTestScript();
  });

  after(() => {
    cy.postTestScript({ landlordEmail, renterEmail });
  });

  it('landlord should not be enrolled in RP', () => {
    cy.createUserByEmail(landlordEmail);
    cy.createListing().then((listing) => {
      cy.wrap(listing.listingAlias).as('listingAlias');
    });
    cy.forceEnrollUserIntoRentalProtectionExperiment();

    cy.get<string>('@listingAlias').then((listingAlias) => {
        cy.confirmListingExistsInListingHub(listingAlias);
        cy.visit(getFindTenantPageUrl(listingAlias));
      });
  });
});
