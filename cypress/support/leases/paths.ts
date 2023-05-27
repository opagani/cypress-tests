// Only endpoints that are not exposed through the integrated environment will need to have
// backendBaseUrl prepended to the URL
// Ex. https://www.qa.zillow.net/leasing/ is not exposed, but https://comet1.testpads.net/leasing is
export const backendBaseUrl = Cypress.env('backendBaseUrl');

// rental-manager
const LEASING_LANDLORD_WEB = 'rental-manager/leasing';

// leasing api
export const ZTEST_LEASING_API = `${backendBaseUrl}/leasing`;
export const FORCE_LEASE_INTO_SIGNING_COMPLETE_STATE = `${ZTEST_LEASING_API}/api/v1/testingConvenience/forceLeaseIntoSigningCompleteState`;

export const getLandlordLeasesOnboardingUrl = (listingId: string) => {
  return `${LEASING_LANDLORD_WEB}/property/${listingId}/onboarding`;
};

export const getLandlordCreateLeaseUrl = (listingId: string) => {
  return `${getLandlordLeasesOnboardingUrl(listingId)}/createLease`;
};
