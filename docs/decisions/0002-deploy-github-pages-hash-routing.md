# 0002 - Deploy: GitHub Pages with hash routing

- Status: accepted
- Date: 2026-04-25

## Context
The app must run on GitHub Pages without server-side routing.

## Decision
Use hash routing (`/#/...`) and deploy static assets to GitHub Pages.

## Alternatives considered
- Browser history routing: rejected due 404 refresh issues on static hosting.
- Vercel SSR setup: postponed.

## Consequences
- URLs include `#` but are reliable on static hosting.
- Simple deployment pipeline and low infrastructure overhead.

