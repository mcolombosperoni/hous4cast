# Project Plan

## Overview
This document outlines the high-level plan for the development of the hous4cast platform, including major epics, milestones, and delivery workflow. It is kept in sync with the task board and user stories. All three documents (plan, user stories, task board) must remain in sync and traceable: every task must reference its user story, and every user story must reference its epic.

## Epics & Milestones
- Epic A: Foundation and CI/CD guardrails
- Epic B: First estimator slice
- Epic C: UX baseline
- Epic D: Admin and QR
- Epic E: Hardening
- Epic F: Release automation
- Epic G: Admin sharing UX
- Epic H: Configurable form and branding (palette, logo, image)

## Current Increment
- Epic H: Configurable form and branding (palette, logo, image)
  - Image storage: Cloudinary unsigned upload (ADR 0012) — Firebase Storage not available on Spark plan
  - Cloudinary: cloud name `dcxpdproj`, upload preset `hous4cast`, folder `branding`
- See task board for current increment and status.

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
