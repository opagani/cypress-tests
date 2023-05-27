// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />
/// <reference types="cypress-iframe" />

// https://github.com/typescript-eslint/typescript-eslint/issues/3295
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Listing = import('./listings/models/createFakeListingRawResponseModel').Listing;

declare namespace Cypress {
  interface Chainable {
    // listings/commands.js
    /**
     * Custom command to log in as rental manager mocked user.
     * @example cy.loginAsMockedUser('1111111111', '/rental-manager/')
     */
    loginAsMockedUserByToken(mockedUserToken: string, rentalManagerRoot: string): Chainable<Element>;
    loginAsMockedUserByEmail(mockedUserEmail: string, rentalManagerRoot: string): Chainable<Element>;
    createUser();
    createUserByEmail(email: string);
    createListing(listing?: { activate?: boolean; streetAddress?: string }): Chainable<Listing>;
    deactivateListing(listingAlias: string | undefined);
    forceEnrollUserIntoRentalProtectionExperiment();
    forceEnrollUserIntoModularListingRentalProtectionExperiment();
    forceEnrollUserIntoTwoStepOptIn();
    forceUnenrollUserFromRachelPays();
    enableIdVerificationFlag();
    getDetails(listingId: string | undefined);
    optInToRentalProtection();
    optInToRentalProtectionWithTwoStepOptIn();
    optInToRentalProtectionWithTwoStepOptInWhenCreatingListing();
    confirmListingExistsInListingHub(listingAlias: string);
    getUserZuid(): Chainable<number>;
    payAndPublishListing();
    petsPolicy(listingAlias: string);
    enableRentGuaranteeWithApi(listingAlias: string);
    confirmRentalProtectionPageWillLoad(listingAlias: string);
    completeSenseOfHomeBannerOptin();
    applicationsAccepted(listingAlias: string);

    // applications/commands.js
    startNewApplication(listindId: string, zuid: number);
    navigateToIncomeHistorySection();
    uploadJPEG();
    submitApplication(
      applicationId: number,
      listingId: string,
      shareBackgroundReport?: boolean,
      shareCreditReport?: boolean,
      shareDocs?: boolean,
    );
    markLandlordTermsAndConditions();
    markUserAsIdVerified(zuid: number);
    identifyUser(zuid: number);
    createAndSubmitApplication(shouldUploadIncomeDocs?: boolean): Chainable<number>;
    completeApplication(args: {
      landlordEmail: string;
      renterEmail: string;
      shouldUploadIncomeDocs?: boolean;
      shouldVerifyIncomeDocs?: boolean;
      isIncomeToRentEligible?: boolean;
      shouldIdVerifyLandlord?: boolean;
      shouldMarkLandlordTermsAndConditions?: boolean;
    });
    confirmGetQuestionAnswersAllSucceeds(listingId: string);

    // leases/commands.js
    selectLeaseTerm();
    uploadLeaseDocument();
    selectTenantFromExperianProfile();
    fillInLeaseSummary();
    completeUploadSignedLease();
    forceLeaseIntoSigningCompleteState(leaseId: number);
    createLeaseWithWizard();
    createLeaseWithWizardPart1();
    createLeaseWithWizardPart2();
    createLeaseWithWizardPart3();
    createLeaseWithWizardPart4();
    createLeaseWithWizardPart5();

    // payments/commands.js
    onboardToPayments();
    completePaymentsOnboardingAndCoverageRequest();
    completePaymentsOnboardingButCancelSigningCoverageRequest();

    // manage-policy/commands.js
    mockPolicyLifecycleProcess(policyId: number);
    forcePolicyIntoEffectiveStatus(listingAlias: string);
    verifyPolicyIsEffective(listingAlias: string);
    cancelPolicy(listingAlias: string);
    getPolicyIdFromListing(listingAlias: string, leaseId: number): Chainable<number>;

    // common/commands.js
    postTestScript(args: {
      landlordEmail: string;
      renterEmail: string;
    });
    preTestScript();
  }
}
