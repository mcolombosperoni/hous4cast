# 0006 - Testing strategy: Vitest + Playwright

- Status: accepted
- Date: 2026-04-25

## Context
The project requires strict quality gates with unit/component tests and multibrowser acceptance tests.

## Decision
Use Vitest + Testing Library for unit/component tests and Playwright for acceptance tests on Chromium, Firefox and WebKit.

## Alternatives considered
- Jest + Cypress: rejected to reduce stack complexity in Vite projects.

## Consequences
- Fast local test loop with Vitest.
- Cross-browser confidence in CI with Playwright.

