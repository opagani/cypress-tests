const { getLandlordApplicationOverviewUrl, getRenterIncomeHistoryPageUrl } = require('./paths');
const getRequestBodyForSaveQuestionAnswers = require('./getRequestBodyForSaveQuestionAnswers');
const EXPERIAN_PROFILES = require('./experianProfiles');
const { uploadDocument } = require('../utils/uploadDocument');

const {
  CAPPS_GET_QUESTION_ANSWERS_ALL,
  CAPPS_SAVE_QUESTION_ANSWER,
  MARK_ACCEPTED_TERMS,
  WRITE_VALID_PAYMENT_STATUS,
  CAPPS_STATUS_UPDATE_CALLBACK,
  IDV_MARK_USER_AS_ID_VERIFIED,
  CAPPS_SUBMIT_APPLICATION_API,
  IDV_IDENTIFY_USER,
  IDV_SUBMIT_ANSWERS,
  IDV_IS_IDENTIFIED,
} = require('./paths');
const { pollEndpoint } = require('../listings/commands');

const EXPERIAN_TAC_TYPE = 'experianTac';
const EXPERIAN_PP_TYPE = 'experianPrivacyPolicy';
const CIC_TAC_TYPE = 'cicTac';

const CURRENT_EXPERIAN_TAC_VERSION = 3;
const CURRENT_EXPERIAN_PP_VERSION = 3;
const CURRENT_CIC_TAC_VERSION = 1;
const CURRENT_CIC_CONFIRMATION_RENTER_VERSION = 1;
const CURRENT_EXPERIAN_CIC_WC_RENTER_VERSION = 1;

const CURRENT_EXPERIAN_WC_LANDLORD_VERSION = 2;
const CURRENT_CHECKR_TAC_LANDLORD_VERSION = 2;

// Mark/accept terms and conditions for renter
const markRenterTermsCurrent = () => {
  const terms = [
    { type: EXPERIAN_TAC_TYPE, version: CURRENT_EXPERIAN_TAC_VERSION },
    { type: EXPERIAN_PP_TYPE, version: CURRENT_EXPERIAN_PP_VERSION },
    { type: CIC_TAC_TYPE, version: CURRENT_CIC_TAC_VERSION },
    { type: 'cicConfirmationRenter', version: CURRENT_CIC_CONFIRMATION_RENTER_VERSION },
    { type: 'experianCicWrittenConsentRenter', version: CURRENT_EXPERIAN_CIC_WC_RENTER_VERSION },
  ];

  return cy.request('POST', MARK_ACCEPTED_TERMS, {
    termsAndConditions: terms,
  });
};

// Marks a user as ID verified within id-verification
const markUserAsIdVerified = (zuid) => {
  return cy.request({
    method: 'POST',
    url: IDV_MARK_USER_AS_ID_VERIFIED,
    body: {
      userId: zuid,
      zgAuthZone: 'zillow',
      requestingClient: 'tg.comet-rental-tests',
    },
    qs: {
      apiKey: 'changeit',
    },
  });
};

const postValidPaymentForApplication = (zuid) => {
  return cy.request({
    method: 'POST',
    url: WRITE_VALID_PAYMENT_STATUS,
    body: {
      userId: zuid,
      zgAuthZone: 'zillow',
    },
    qs: {
      apiKey: 'changeit',
    },
  });
};

// SERVICE_FAILED status for background report and credit reports allows a user to submit the application
const writeServiceFailedReportStatusesToCapps = (zuid) => {
  const millisecondsIn30Days = 2592000000;
  const expiration = Date.now() + millisecondsIn30Days;

  // mark background report
  cy.request({
    method: 'POST',
    url: CAPPS_STATUS_UPDATE_CALLBACK,
    body: {
      userId: zuid,
      zgAuthZone: 'zillow',
      service: 'BACKGROUND_CIC',
      status: 'SERVICE_FAILED',
      expirationMs: expiration,
      updateTimeMs: Date.now(),
    },
    qs: {
      apiKey: 'changeit',
    },
  }).then((backgroundReportRes) => {
    cy.task('log', `marking background report as failed for zuid: ${zuid}`);
    cy.task('log', JSON.stringify(backgroundReportRes, null, 2));
  });

  // mark credit report
  cy.request({
    method: 'POST',
    url: CAPPS_STATUS_UPDATE_CALLBACK,
    body: {
      userId: zuid,
      zgAuthZone: 'zillow',
      service: 'CREDIT',
      status: 'SERVICE_FAILED',
      expirationMs: expiration,
      updateTimeMs: Date.now(),
    },
    qs: {
      apiKey: 'changeit',
    },
  }).then((creditReportRes) => {
    cy.task('log', `marking credit report as failed for zuid: ${zuid}`);
    cy.task('log', JSON.stringify(creditReportRes, null, 2));
  });
};

function confirmGetQuestionAnswersAllSucceeds(listingId) {
  pollEndpoint({
    requestParams: {
      url: CAPPS_GET_QUESTION_ANSWERS_ALL,
      qs: {
        listingId,
      },
      failOnStatusCode: false
    },
    retryLimit: 50,
    assertionCallback: (body) => body.success === true,
  });
}

Cypress.Commands.add('confirmGetQuestionAnswersAllSucceeds', (listingAlias) => {
  cy.task('log', `confirmGetQuestionAnswersAllSucceeds STARTED`);
  return confirmGetQuestionAnswersAllSucceeds(listingAlias);
});

Cypress.Commands.add('startNewApplication', (listingId, zuid) => {
  cy.task('log', `starting a new application listingId: ${listingId}`);

  cy.confirmGetQuestionAnswersAllSucceeds(listingId);
  cy.request({
    url: CAPPS_GET_QUESTION_ANSWERS_ALL,
    qs: {
      listingId,
    },
  }).as('getQuestionAnswersAll');

  return cy.get('@getQuestionAnswersAll').then((response) => {
    cy.task('log', JSON.stringify(response, null, 2));
    if (response.status === 200 && response.body) {
      const applicationId = response.body.applicationId;

      // save_question_answers
      // https://gitlab.zgtools.net/zillow/rental-applications/tg-comet-rentals-tests/-/blob/master/comet_rentals_tests/lib/api_setup_utils.py#L956
      const answers = getRequestBodyForSaveQuestionAnswers();

      cy.request('POST', CAPPS_SAVE_QUESTION_ANSWER, {
        answers,
        applicationId,
      }).then((response) => {
        cy.task('log', `Sending a full application to capps`);
        cy.task('log', JSON.stringify(response, null, 2));
      });

      // set current idv and current terms
      markRenterTermsCurrent().then((response) => {
        cy.task('log', `marking user terms for zuid: ${zuid}`);
        cy.task('log', JSON.stringify(response, null, 2));
      });

      markUserAsIdVerified(zuid).then((response) => {
        cy.task('log', `marking user as id verified for zuid: ${zuid}`);
        cy.task('log', JSON.stringify(response, null, 2));
      });

      postValidPaymentForApplication(zuid).then((response) => {
        cy.task('log', `posting valid payment status for zuid: ${zuid}`);
        cy.task('log', JSON.stringify(response, null, 2));
      });

      writeServiceFailedReportStatusesToCapps(zuid);

      return cy.wrap(applicationId);
    }

    return cy.wrap(null);
  });
});

Cypress.Commands.add('navigateToIncomeHistorySection', () => {
  cy.get('.category__link.incomeHistory').scrollIntoView().click();
  cy.get('.Modal-back.Modal-button.shown', { timeout: 10000 }).scrollIntoView().click();
});

Cypress.Commands.add('uploadJPEG', () => {
  cy.task('log', 'Uploading jpeg income document');
  uploadDocument('images/zon-jpeg.jpeg');
  cy.task('log', 'Confirming upload complete');
  cy.intercept('https://www.zillowdocs.com/api/v1/documents/actions/upload').as('zDocsUpload');
  cy.intercept('/renter-hub/applications/proxy/renter-hub-api/rad/verifyUpload').as('radVerifyUpload');
  cy.wait(['@zDocsUpload', '@radVerifyUpload']);
});

Cypress.Commands.add(
  'submitApplication',
  (applicationId, listingId, shareBackgroundReport = false, shareCreditReport = false, shareDocs = true) => {
    cy.task('log', 'Submitting application with /submitApplication');
    cy.request({
      method: 'POST',
      url: CAPPS_SUBMIT_APPLICATION_API,
      body: {
        requestingClient: 'tg.comet-rentals-tests',
        applicationId: applicationId,
        listingId: listingId,
        creditReportAvailable: shareCreditReport,
        backgroundReportAvailable: shareBackgroundReport,
        incomeVerificationDocumentsAvailable: shareDocs,
      },
    }).then((response) => {
      cy.task('log', JSON.stringify(response, null, 2));
      assert.equal(response.status, 200);
      cy.task('log', 'Application submitted successfully');
    });
  },
);

Cypress.Commands.add('markLandlordTermsAndConditions', () => {
  const terms = [
    { type: EXPERIAN_TAC_TYPE, version: CURRENT_EXPERIAN_TAC_VERSION },
    { type: EXPERIAN_PP_TYPE, version: CURRENT_EXPERIAN_PP_VERSION },
    { type: CIC_TAC_TYPE, version: CURRENT_CIC_TAC_VERSION },
    { type: 'experianWrittenConsentLandlord', version: CURRENT_EXPERIAN_WC_LANDLORD_VERSION },
    { type: 'checkrTacLandlord', version: CURRENT_CHECKR_TAC_LANDLORD_VERSION },
  ];

  cy.request('POST', MARK_ACCEPTED_TERMS, {
    termsAndConditions: terms,
  });
});

Cypress.Commands.add('markUserAsIdVerified', (zuid) => {
  markUserAsIdVerified(zuid);
});

const NONE_OF_THE_ABOVE_OPTION = 'NONE OF THE ABOVE/DOES NOT APPLY';
const ZG_AUTH_ZONE = 'zrm';

const confirmUserIsIdentified = (zuid) => {
  return cy.request({
    method: 'GET',
    url: IDV_IS_IDENTIFIED,
    qs: {
      userId: zuid,
      zgAuthZone: ZG_AUTH_ZONE,
      requestingClient: 'tg.comet-rentals-tests',
      apiKey: 'changeit',
    },
  });
};

Cypress.Commands.add('identifyUser', (zuid) => {
  const CHARLES = EXPERIAN_PROFILES[3];

  cy.task('log', `Calling /performIdentityCheck to get idv questions for zuid: ${zuid}`);
  cy.request({
    method: 'POST',
    url: IDV_IDENTIFY_USER,
    failOnStatusCode: false,
    body: {
      firstName: CHARLES['firstName'],
      middleName: CHARLES['middleName'],
      lastName: CHARLES['lastName'],
      currentAddress: CHARLES['currentAddress'],
      currentCity: CHARLES['currentCity'],
      currentState: CHARLES['currentState'],
      currentZip: CHARLES['currentZip'],
      email: 'jimbobfisheries@notification.hotpads.com',
      dob: CHARLES['dob'],
      phone: '2065551212',
      gen: CHARLES['gen'],
      ssn: CHARLES['ssn'],
      userId: zuid,
      zgAuthZone: ZG_AUTH_ZONE,
      requestingClient: 'tg.comet-rentals-tests',
    },
    qs: {
      apiKey: 'changeit',
    },
  }).then((response) => {
    cy.task('log', JSON.stringify(response, null, 2));

    let responseBody = { ...response.body };

    // this is to ensure success in the case of the
    // performIdentityCheckCreateBackgroundCandidate api call
    if (
      responseBody.CREATE_BACKGROUND_CANDIDATE &&
      responseBody.CREATE_BACKGROUND_CANDIDATE.responseType !== 'SUCCESS'
    ) {
      throw Error('Unable to create a candidate id.');
    }

    if (responseBody.PERFORM_IDENTITY_CHECK) {
      responseBody = responseBody.PERFORM_IDENTITY_CHECK;
    }

    // Return if already currently identified.
    if (responseBody['responseType'] == 'INVALID_REQUEST_CURRENTLY_IDENTIFIED') {
      return;
    }

    if (!responseBody.success) {
      throw Error('Unable to set status of user to CURRENTLY_IDENTIFIED.');
    }

    if (response.status !== 200) {
      throw Error('Unable to set status of user to CURRENTLY_IDENTIFIED.');
    }

    const answerIndices = [];
    const questionSet = responseBody.questionSet;

    questionSet.forEach(({ questionText, questionChoices }) => {
      cy.task('log', `Question: ${questionText}`);
      cy.task('log', `Answers: ${questionChoices}`);

      let indexOfCorrectAnswer;
      if (CHARLES.questionMap.hasOwnProperty(questionText)) {
        let correctAnswer = CHARLES.questionMap[questionText];
        if (questionChoices.includes(correctAnswer)) {
          indexOfCorrectAnswer = questionChoices.indexOf(correctAnswer) + 1;
        } else {
          correctAnswer = CHARLES.questionExtraMap[questionText];
          if (questionChoices.includes(correctAnswer)) {
            indexOfCorrectAnswer = questionChoices.indexOf(correctAnswer) + 1;
          } else {
            indexOfCorrectAnswer = questionChoices.indexOf(NONE_OF_THE_ABOVE_OPTION) + 1;
          }
        }
      } else {
        cy.task('log', 'UNKNOWN QUESTION!');

        indexOfCorrectAnswer = questionChoices.indexOf(NONE_OF_THE_ABOVE_OPTION) + 1;
      }
      cy.task('log', `Index of correct answer: ${indexOfCorrectAnswer}`);

      answerIndices.push(indexOfCorrectAnswer);

      cy.task('log', `All answers: ${answerIndices}`);
    });

    cy.task('log', `Calling /submitIdentityAnswers for zuid: ${zuid}`);

    cy.request({
      method: 'POST',
      url: IDV_SUBMIT_ANSWERS,
      body: {
        answers: answerIndices,
        userId: zuid,
        zgAuthZone: ZG_AUTH_ZONE,
        requestingClient: 'tg.comet-rentals-tests',
      },
      qs: {
        apiKey: 'changeit',
      },
    }).then((response) => {
      cy.task('log', JSON.stringify(response, null, 2));
      confirmUserIsIdentified(zuid).then((response) => {
        assert.equal(response.status, 200);
        assert.equal(response.body.identificationStatusType, 'CURRENTLY_IDENTIFIED');
      });
    });
  });
});

Cypress.Commands.add('createAndSubmitApplication', (shouldUploadIncomeDocs = true) => {
  return cy.getUserZuid().then((zuid) => {
    return cy.get('@listingAlias').then((listingAlias) => {
      return cy.startNewApplication(listingAlias, zuid).then((applicationId) => {
        assert.exists(applicationId);
        cy.task('log', `Application created with applicationId ${applicationId}`);

        if (shouldUploadIncomeDocs) {
          cy.visit(getRenterIncomeHistoryPageUrl(listingAlias, applicationId))
          cy.uploadJPEG();
        }
        cy.submitApplication(applicationId, listingAlias);
        return cy.wrap(applicationId).as('applicationId');
      });
    });
  });
});

Cypress.Commands.add(
  'completeApplication',
  ({
    landlordEmail,
    renterEmail,
    shouldUploadIncomeDocs = true,
    shouldVerifyIncomeDocs = true,
    isIncomeToRentEligible = true,
    shouldIdVerifyLandlord = true,
    shouldMarkLandlordTermsAndConditions = true,
  }) => {
    cy.task('log', `completeApplication STARTED`);

    cy.get('@listingAlias').then((listingAlias) => {
      cy.applicationsAccepted(listingAlias);
    });

    // mark landlords t&c's and id verify
    if (shouldMarkLandlordTermsAndConditions) {
      cy.markLandlordTermsAndConditions();
    }

    if (shouldIdVerifyLandlord) {
      cy.getUserZuid().then((zuid) => {
        cy.identifyUser(zuid);
      });
    }

    // application endpoints require listing to be in listing hub
    cy.get('@listingAlias').then((listingAlias) => {
      cy.confirmListingExistsInListingHub(listingAlias);
    });

    // switch to renter
    cy.createUserByEmail(renterEmail);

    // complete and submit application with income documents
    cy.createAndSubmitApplication(shouldUploadIncomeDocs);

    // switch back to landlord and confirm eligibility
    cy.createUserByEmail(landlordEmail);
    if (shouldVerifyIncomeDocs) {
      cy.get('@listingAlias').then((listingAlias) => {
        cy.get('@applicationId').then((applicationId) => {
          cy.visit(getLandlordApplicationOverviewUrl(applicationId, listingAlias));

          // mark income doc eligibility
          cy.get('[data-test="verify-income-button"]').click();

          cy.get('[data-test="document-controller-document-card"]').click();
          cy.get('[data-test="multi-applicant-document-view-done-btn"').click();

          const eligibilityCtaSelector = isIncomeToRentEligible
            ? '[data-test="verify-income-eligible-cta"]'
            : '[data-test="verify-income-ineligible-cta"]';

          const eligibilityAlertSelector = isIncomeToRentEligible
            ? '[data-test="application-rollup-rg-eligible-alert"]'
            : '[data-test="application-rollup-rg-ineligible-alert"]';

          cy.get(eligibilityCtaSelector).click();
          cy.get('[data-test="verify-income-info-confirmation-modal-footer-button"]').click();

          cy.get(eligibilityAlertSelector).should('exist');
        });
      });
    }

    cy.task('log', `completeApplication FINISHED`);    
  },
);
