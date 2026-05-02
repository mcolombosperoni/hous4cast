# Project Plan

## Overview
This document outlines the high-level plan for the development of the hous4cast platform, including major epics, milestones, and delivery workflow. It is kept in sync with the task board and user stories. All three documents (plan, user stories, task board) must remain in sync and traceable: every task must reference its user story, and every user story must reference its epic.

## Epics & Milestones
- Epic A: Foundation and CI/CD guardrails ✅
- Epic B: First estimator slice ✅
- Epic C: UX baseline ✅
- Epic D: Admin and QR ✅
- Epic E: Hardening ✅
- Epic F: Release automation ✅
- Epic G: Admin sharing UX ✅
- Epic H: Configurable form and branding (palette, logo, image) ✅
- Epic I: _(to be planned — proposals below)_

## Epic I — Candidate proposals

The following are candidate directions for the next epic, to be chosen and prioritised with the client:

1. **Branding applied to estimate page** — Apply the agency's palette, logo, and cover image to the estimate page and result view, so that the seller sees a fully branded experience when scanning the QR.
2. **Lead capture and notification** — After form submission, save the seller's contact details (name, email, phone, address) to a backend (Firestore), and optionally notify the agent via email.
3. **Multi-agency support** — Add a second agency config (e.g. example-agency-milano fully wired), so that the platform supports multiple tenants from a single deployment.
4. **Estimate PDF export** — Allow the seller to download a branded PDF of the estimate result directly from the page.
5. **Admin dashboard — leads view** — Show submitted leads in the admin panel, filterable by config/date.

## Current Increment
- Epic H closed. Awaiting Epic I planning with client.

## Delivery Workflow
- All features are developed outside-in: acceptance tests first, then unit/component tests.
- Each increment is delivered as a complete, tested slice.
- Push only at increment completion, then wait for explicit approval before continuing.
- Releases are performed only from a clean working tree and on the `main` branch using release scripts.

## References
- [Task board](./task-board.md)
- [User stories](./user-stories.md)
- [Decision records (ADR)](./decisions/README.md)

---

_Last updated: 2026-05-02_
