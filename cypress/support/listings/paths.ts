export const RENTAL_MANAGER_API_V1_PATH = 'rental-manager-api/api/v1';
export const GET_USER = `${RENTAL_MANAGER_API_V1_PATH}/users/get?pageWithSensitiveInformation=true&includeSummary=false`;
export const ENABLE_RENT_GUARANTEE = `${RENTAL_MANAGER_API_V1_PATH}/users/properties/rentGuarantee/enable`;
export const REGISTER_ACCOUNT = `${RENTAL_MANAGER_API_V1_PATH}/zillowAccounts/registerStaging`;
export const CREATE_FAKE_LISTING = `${RENTAL_MANAGER_API_V1_PATH}/users/devTools/createFakeListings`;
export const DEACTIVATE_LISTING = `${RENTAL_MANAGER_API_V1_PATH}/users/properties/deactivate`;
export const GET_RENTAL_PROTECTION_PAGE_FOR_LISTING = `${RENTAL_MANAGER_API_V1_PATH}/users/properties/rentGuarantee/getRentalProtectionPageForListing`;
export const APPLICATIONS_ACCEPTED = `${RENTAL_MANAGER_API_V1_PATH}/users/properties/applicationsAccepted`;
export const CRITERIA = `${RENTAL_MANAGER_API_V1_PATH}/users/properties/criteria/set`;

export const RENTAL_MANAGER_API_V2_PATH = 'rental-manager-api/api/v2';
export const GET_DETAILS = `${RENTAL_MANAGER_API_V2_PATH}/users/properties/details`;

export const RENTAL_MANAGER_WEB_PATH = 'rental-manager';
export const getListingPageUrl = (listingAlias: string) =>
  `${RENTAL_MANAGER_WEB_PATH}/properties/${listingAlias}/listing`;
export const getFindTenantPageUrl = (listingAlias: string) =>
  `${RENTAL_MANAGER_WEB_PATH}/properties/${listingAlias}/find-tenants`;
export const getManageTenantsPageUrl = (listingAlias: string) =>
  `${RENTAL_MANAGER_WEB_PATH}/properties/${listingAlias}/manage-tenants`;
export const getManagePolicyPageUrl = (listingAlias: string) =>
  `${RENTAL_MANAGER_WEB_PATH}/rental-protection/properties/${listingAlias}/managePolicy`;
