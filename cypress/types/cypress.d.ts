/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    expect(subject: any, message?: string): Chainable<Assertion>;
  }
}
