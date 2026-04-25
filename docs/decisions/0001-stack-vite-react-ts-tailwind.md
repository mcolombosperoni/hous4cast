# 0001 - Stack: Vite + React + TypeScript + Tailwind

- Status: accepted
- Date: 2026-04-25

## Context
The project needs a fast static-first frontend stack compatible with GitHub Pages and strict typing.

## Decision
Use Vite + React + TypeScript (strict mode) with Tailwind CSS for UI.

## Alternatives considered
- Next.js: discarded for static hosting complexity in this phase.
- SvelteKit: postponed to avoid stack churn.

## Consequences
- Fast local DX and build.
- Tight TypeScript integration and explicit typing policy.

