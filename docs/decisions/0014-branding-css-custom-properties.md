# ADR-0014: CSS Custom Properties for Runtime Agency Branding

## Status
Accepted

## Context
Epic J requires the estimate page (`/estimate/:configId`) to apply the agency's palette, logo, and cover image at runtime, loaded from Firestore/localStorage via `getBrandingConfig()`. The palette must be applied without a build step and must not conflict with Tailwind's compile-time utility classes.

## Decision
- Inject the agency palette as CSS custom properties (`--brand-primary`, `--brand-secondary`, `--brand-text`, `--brand-bg`) on a scoped wrapper `div` around the estimate page content.
- Use `BrandingConfig.paletteLight` in light mode and `BrandingConfig.paletteDark` in dark mode (detected via `window.matchMedia('(prefers-color-scheme: dark)')`), listening for runtime OS theme changes.
- When no branding is configured (`BrandingConfig` is `null`), the CSS vars are not set and Tailwind's default neutral palette is used unchanged.
- The logo is rendered as an `<img>` in the page header. When absent, the plain agency name text is shown.
- The cover image is rendered as a full-width hero `<img>` above the form. When absent, no hero is shown.
- `applyBrandingVars(el, palette)` is a pure utility function (`src/app/brandingUtils.ts`) with no React dependency, making it independently testable.

## Source of Truth
`BrandingConfig` from Firestore (via `getBrandingConfig`) is the live source for the estimate page, not `AgencyConfig.branding`. The static config branding is used only as a seed for the admin editor initial state.

## Consequences
- Palette changes made in the admin branding editor are reflected on the next load of the estimate page without a deploy.
- No Tailwind config modification is needed.
- Custom properties are scoped to the wrapper and do not leak to other routes.
- Dark mode uses the purpose-built `paletteDark` palette, maintaining WCAG AA contrast requirements.

## Alternatives Considered
- **Tailwind arbitrary values / JIT**: would require injecting config at build time — not viable for runtime branding.
- **Inline styles on every element**: verbose and harder to maintain; custom properties on a single wrapper are cleaner.

