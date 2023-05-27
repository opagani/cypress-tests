// Only endpoints that are not exposed through the integrated environment will need to have
// backendBaseUrl prepended to the URL
// Ex. https://www.qa.zillow.net/capps/ is not exposed, but https://comet1.testpads.net/capps is
export const backendBaseUrl = Cypress.env('backendBaseUrl');

// rental-manager
export const APPLICATIONS_LANDLORD_WEB = 'rental-manager/applications';

// renter-hub
export const APPLICATIONS_RENTER_WEB = 'renter-hub/applications';
export const RENTER_HUB_API = `${APPLICATIONS_RENTER_WEB}/proxy/renter-hub-api`;
export const CAPPS_GET_QUESTION_ANSWERS_ALL = `${RENTER_HUB_API}/api/v1/users/capps/getQuestionAnswersAll`;
export const CAPPS_SAVE_QUESTION_ANSWER = `${RENTER_HUB_API}/api/v1/users/capps/saveQuestionAnswer`;
export const MARK_ACCEPTED_TERMS = `${RENTER_HUB_API}/termsandconditions/markAcceptedTerms`;
export const CAPPS_SUBMIT_APPLICATION_API = `${RENTER_HUB_API}/api/v1/users/capps/submitApplication`;
export const getRenterIncomeHistoryPageUrl = (listingAlias, applicationId) => `${APPLICATIONS_RENTER_WEB}/listing/${listingAlias}/rental-application/${applicationId}/overview/form/incomeHistory-currentIncomeOnly`;

// application-payment
export const APPLICATION_PAYMENT_BASE_PATH = `${backendBaseUrl}/application-payment/api`;
export const WRITE_VALID_PAYMENT_STATUS = `${APPLICATION_PAYMENT_BASE_PATH}/writeValidPaymentStatus`;

// capps
export const ZTEST_CAPPS_API = `${backendBaseUrl}/capps`;
export const CAPPS_STATUS_UPDATE_CALLBACK = `${ZTEST_CAPPS_API}/internal/api/v2/statusUpdateCallback`;
export const GET_LISTING_EXISTS_IN_LISTING_HUB_URL = `${ZTEST_CAPPS_API}/api/test/admin/getListingExistsInListingHub`;

// id-verification
export const IDV_BASE_PATH = `${backendBaseUrl}/id-verification/api`;
export const IDV_MARK_USER_AS_ID_VERIFIED = `${IDV_BASE_PATH}/markUserAsIdVerified`;
export const IDV_IDENTIFY_USER = `${IDV_BASE_PATH}/performIdentityCheck`;
export const IDV_SUBMIT_ANSWERS = `${IDV_BASE_PATH}/submitIdentityAnswers`;
export const IDV_IS_IDENTIFIED = `${IDV_BASE_PATH}/isIdentified`;

export const getRentalApplicationUrl = (applicationId: number, listingId: string) => {
  return `${APPLICATIONS_RENTER_WEB}/listing/${listingId}/rental-application/${applicationId}/overview`;
};

export const getLandlordApplicationOverviewUrl = (applicationId: number, listingId: string) => {
  return `${APPLICATIONS_LANDLORD_WEB}/${applicationId}?propertyId=${listingId}`;
};
