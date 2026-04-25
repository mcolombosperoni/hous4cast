# 0004 - Config-driven CMS content

- Status: accepted
- Date: 2026-04-25

## Context
Each agency needs customized labels, disclaimers, CTA text and contact details without code rewrites.

## Decision
Treat agency content as code configuration, including form copy, result copy and CTA blocks.

## Alternatives considered
- Hardcoded copy per page: rejected.
- External CMS: postponed to later releases.

## Consequences
- Fast customization by config file.
- Better testability and reproducibility.

