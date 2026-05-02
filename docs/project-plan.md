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
- Epic I: Admin-editable estimation config _(in progress)_

## Epic I — Admin-editable Estimation Config

Goal: agency admins can edit zones, coefficients, pricing, sqm range, spread factor, and privacy text from the admin UI without code deployments.

Key design decisions:
- Firestore collection `estimationConfig`, one doc per `configId`, stores overridable fields only (excludes `id`, `agencyName`, `branding`, `formFields`).
- Merge strategy: deep-merge Firestore overrides on top of static base config (Firestore wins).
- LocalStorage fallback key: `hous4cast:estimationConfig:{configId}` written on every save.
- Static configs remain as seeds — never patched, only shadowed at runtime.
- See ADR-0013 for full schema and rationale.

## Current Increment
- Epic I: T47–T56 — see task board.

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
