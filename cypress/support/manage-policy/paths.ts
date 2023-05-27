export const backendBaseUrl = Cypress.env('backendBaseUrl');
export const RENT_GUARANTEE_BASE_URL = `${backendBaseUrl}/rent-guarantee`;
export const MOCK_POLICY_STATUS = `${RENT_GUARANTEE_BASE_URL}/api/v1/rentguarantee/mockPolicyLifecycleProcess`;
export const GET_POLICY_BY_LISTING = `${RENT_GUARANTEE_BASE_URL}/api/v1/rentguarantee/getPoliciesByListingAndLease`;
