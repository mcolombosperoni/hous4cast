# 0003 - i18n resolution order

- Status: accepted
- Date: 2026-04-25

## Context
The same config must support IT/EN, with language switch and robust fallbacks even when QR has no language.

## Decision
Resolve locale in this order:
1. `lang` query parameter
2. `dl` query parameter (admin default locale in QR)
3. `localStorage.preferredLocale`
4. Browser locale (`navigator.language` normalized)
5. Fallback `en`

## Alternatives considered
- Config-only static locale: rejected due runtime switching requirement.
- i18n path segments (`/en/...`): rejected for hash routing simplicity.

## Consequences
- Shared links remain deterministic.
- User preference persists without blocking explicit URL overrides.

