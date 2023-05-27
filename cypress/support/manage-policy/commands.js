import { getFindTenantPageUrl } from '../../support/listings/paths';
import { GET_POLICY_BY_LISTING, MOCK_POLICY_STATUS } from './paths';

Cypress.Commands.add('mockPolicyLifecycleProcess', (policyId) => {
  cy.task('log', `mockPolicyLifecycleProcess STARTED`);

  cy.request({
    method: 'POST',
    url: MOCK_POLICY_STATUS,
    qs: {
      apiKey: 'changeit',
    },
    body: {
      policyIds: [policyId],
    },
  }).as('mockPolicyLifecycleProcess');

  cy.get('@mockPolicyLifecycleProcess').then((response) => {
    cy.task('log', JSON.stringify(response, null, 2));
    assert.equal(response.status, 200);
    cy.task('log', `mockPolicyLifecycleProcess FINISHED`);
    return;
  });
});

Cypress.Commands.add('forcePolicyIntoEffectiveStatus', (listingAlias) => {
  cy.task('log', `forcePolicyIntoEffectiveStatus STARTED`);

  cy.get('@leaseId').then((leaseId) => {
    cy.getPolicyIdFromListing(listingAlias, leaseId).then((policyId) => {
      if (policyId) {
        cy.mockPolicyLifecycleProcess(policyId);
        cy.mockPolicyLifecycleProcess(policyId);

        cy.task('log', `forcePolicyIntoEffectiveStatus FINISHED`);
        return;
      }
    });
  });
});

Cypress.Commands.add('verifyPolicyIsEffective', (listingAlias) => {
  // load SoH find tenants page
  cy.visit(getFindTenantPageUrl(listingAlias));

  // verify rental protection one time modal to say that my policy is effective
  cy.get('[data-testid="submit-button"]').click();

  // verify rental protection banner at SoH page
  cy.get('[data-test="rental-protection-banner"]').should('be.visible');
  cy.get('[data-test="rental-protection-banner"]').should('contain.text', 'Rental Protection is effective');
  cy.get('[data-test="rental-protection-banner"]').scrollIntoView().click();

  // verify manage rental protection page
  cy.get('[data-testid="policy-module-tag"]').should('have.text', 'EFFECTIVE');
  cy.get('[data-test="managePolicy-cancelPolicy"]').should('be.visible');
  cy.get('[data-test="managePolicy-fileClaim"]').should('be.visible');
});

Cypress.Commands.add('cancelPolicy', (listingAlias) => {
  // load SoH find tenants page
  cy.visit(getFindTenantPageUrl(listingAlias));

  // verify rental protection banner at SoH page
  cy.get('[data-test="rental-protection-banner"]').should('be.visible');
  cy.get('[data-test="rental-protection-banner"]').scrollIntoView().click();
  
  // cancel policy
  cy.get('[data-test="managePolicy-cancelPolicy"]').click();
  cy.get('[data-testid="submit-button"]').click();
  cy.get('[data-testid="submit-button"]').click();

  // verify manage rental protection page
  cy.get('[data-testid="policy-module-tag"]').should('have.text', 'CANCEL REQUEST SENT');
  cy.contains('You requested to cancel your Rental Protection policy. Processing will take up to 24 hours.');
  cy.get('[data-test="managePolicy-cancelPolicy"]').should('be.disabled');
  cy.get('[data-test="managePolicy-fileClaim"]').should('be.visible');
});

Cypress.Commands.add('getPolicyIdFromListing', (listingAlias, leaseId) => {
  cy.request({
    method: 'GET',
    url: GET_POLICY_BY_LISTING,
    qs: {
      listingAlias,
      leaseId,
      apiKey: 'changeit',
    },
  }).as('getPolicyIdFromListing');

  cy.get('@getPolicyIdFromListing').then((response) => {
    cy.task('log', `Get policy from Listing response ${JSON.stringify(response)}`);
    cy.task('log', `Get policy from Listing body ${JSON.stringify(response?.body)}`);
    cy.task('log', `Get policy from Listing data ${JSON.stringify(response?.body?.data)}`);
    cy.task('log', `Get policy from Listing policies ${JSON.stringify(response?.body?.data?.policies)}`);
    cy.task('log', JSON.stringify(response?.body?.data?.policies[0], null, 2));
    assert.equal(response.status, 200);
    return cy.wrap(response?.body?.data?.policies[0].policyId);
  });
});