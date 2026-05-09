# User Stories

## MVP

### US-01 - Access estimate page from QR
As a potential seller, I want to scan a QR and open an estimate form, so that I can request an instant price range.

Acceptance criteria:
- QR URL resolves to `/#/estimate/:configId`.
- Page loads branding and copy from selected config.

### US-02 - Complete form and get instant range
As a potential seller, I want to fill the form and see an estimated min/max value, so that I quickly understand a realistic range.

Acceptance criteria:
- All required fields are validated before submit.
- Result is displayed inline after submit.
- Inputs and computed values are logged to console in MVP.

### US-03 - Switch language from UI
As a visitor, I want to switch language from the page, so that I can read content in my preferred language.

Acceptance criteria:
- IT/EN switch available in UI.
- Selection persists via URL and local storage.

### US-04 - Dark mode support
As a visitor, I want dark mode support, so that the page is comfortable at night.

Acceptance criteria:
- Light/dark toggle available.
- Preference is persisted in local storage.

### US-05 - Admin QR generation
As a sales agent, I want an admin page that generates a QR for a config and default locale, so that I can print and share it.

Acceptance criteria:
- `/admin` lists available configs.
- QR includes `dl` default locale hint.

### US-06 - Copy shareable estimate link from admin
As a sales agent, I want to copy the generated estimate link from admin, so that I can quickly share it without printing a QR.

Acceptance criteria:
- Admin page exposes a copy action for the selected config URL.
- User receives localized feedback when copy succeeds or is unavailable.

### US-07 - Fill out valuation form and get instant estimate (Epic H)
As a potential seller, I want to fill out a valuation form with my property details, so that I can instantly receive an estimated price range.

Acceptance criteria:
- The user accesses a form with a fixed structure (same fields for all agencies: property type, area, zone, privacy).
- After submission, an estimated price range is shown inline.
- The experience is mobile-first and localized (EN/IT).
- The user sees and must accept the privacy notice before submitting.

### US-Admin - Configure agency palette, logo, and image (Epic H)
As an admin, I want to configure the agency color palette (primary, secondary, text, background), upload a cover image and a logo, through a modern, responsive interface optimized for mobile and desktop.

Acceptance criteria:
- Admin UI allows selection of palette colors, logo, and image (accordion layout).
- Real-time preview of changes.
- Responsive layout (mobile/desktop).
- Changes are persisted to config.

### US-Admin-Image - Upload e preview logo e immagine agenzia (Epic H)
As an admin, I want to upload a cover image and a logo for the agency, and see a real-time preview, so that the agency branding is complete and visually consistent.

Acceptance criteria:
- L'admin può caricare un logo e una cover image per l'agenzia dalla UI admin (accordion sezioni "Logo" e "Immagine").
- Dopo l'upload, viene mostrata un'anteprima in tempo reale.
- Le immagini vengono salvate e sono persistenti per la configurazione selezionata.
- L'UI è responsive e accessibile.
- Sono presenti test di unità e/o e2e che coprono upload, preview e persistenza.

### US-08 - Extended valuation form with all Gabetti fields (Epic H)
As a potential seller, I want to fill a complete valuation form matching the Gabetti reference form, so that I receive a more accurate price estimate based on all relevant property factors.

Acceptance criteria:
- The form includes all fields from the Gabetti reference form (see field analysis below).
- All fields are validated before submission.
- The estimation engine uses all input factors to compute min/max price.
- The result is displayed inline after submission.
- The form is fully localized (IT/EN) and mobile-first.
- The user must accept the privacy notice before submitting.

#### Field analysis — Gabetti reference form (gabetti-busto-arsizio)

| # | Field | Type | Options / Format | Required | Already present |
|---|-------|------|-----------------|----------|----------------|
| 1 | Metratura | Single choice | fino a 50 mq / 51–70 / 71–110 / 111–149 / 150+ | ✓ | Partially (numeric input, not buckets) |
| 2 | Zona | Single choice | centro / sant'edoardo / frati tribunale / ponzella / cimitero / sacconago / borsano / beata giuliana / sant'anna / ospedale | ✓ | ✓ (select) |
| 3 | Indirizzo e civico | Text input | free text | ✓ | ✗ |
| 4 | Stato interno | Single choice | ottimo / buono / da ristrutturare | ✓ | ✗ |
| 5 | Accessori | Single choice | cantina / 1 box auto / cantina e un box / cantina e due box / nulla | ✓ | ✗ |
| 6 | Piano | Single choice | terra / primo / secondo / terzo / quarto / quinto / sopra il quinto | ✓ | ✗ |
| 7 | Età costruzione | Single choice | 1900–1940 / 1941–1967 / 1968–1980 / 1981–1995 / 1995–2005 / 2006–2015 / 2016–oggi | ✓ | ✗ |
| 8 | Email | Email input | valid email | ✓ | ✗ |
| 9 | Telefono | Phone input | tel format | ✓ | ✗ |
| 10 | Consenso privacy | Checkbox | must be checked | ✓ | ✓ (generic) |

**Fields currently missing:** indirizzo, stato interno, accessori, piano, età costruzione, email, telefono.
**Fields to adapt:** metratura (currently numeric input → add bucket option to config), privacy (already present, keep).

#### Estimation engine impact
The Gabetti calculation applies multiplicative coefficients per zone, state, floor, and age, plus additive bonuses for accessories. The `EstimationEngine` must be extended to support these factors via config, or a Gabetti-specific engine strategy must be added.

### US-09 - Admin-editable estimation config (Epic I)
As an agency admin, I want to edit the full estimation config (zones, sqm buckets, coefficients, spread factor, sqm range, privacy text) from the admin UI, so that I can update pricing and copy without any code deployment.

Acceptance criteria:
- Admin can edit all overridable fields (zones, propertyTypes, sqmRange, spreadFactor, sqmBucketPrices, conditionFactors, floorFactors, eraFactors, accessoriesBonuses, privacy IT/EN) via a dedicated UI section.
- Saving persists the changes to Firestore (`estimationConfig/{configId}`).
- On the estimate page, `getConfig()` returns a config that merges Firestore overrides on top of the static base (Firestore wins).
- If Firestore is unavailable, the last saved override is served from `localStorage` key `hous4cast:estimationConfig:{configId}`.
- If no override exists (Firestore + localStorage both empty), the static base config is used unchanged.
- A change saved in admin is immediately reflected in the estimate page (next load).
- All fields have inline validation (e.g. multipliers must be positive numbers, sqmRange.min < max).

### US-10 - Branded estimate page (Epic J)
As a potential seller, I want to see the agency's colours, logo, and cover image on the estimate page, so that I recognise the agency identity when I scan the QR.

Acceptance criteria:
- The estimate page (`/estimate/:configId`) applies the agency's palette (primary, secondary, text, background) loaded from Firestore.
- The agency logo is shown in the page header.
- A cover image (if configured) is shown as a hero/banner above the form.
- If no branding is configured in Firestore, the page falls back to neutral default styling.
- The branding does not break dark mode or accessibility (contrast ratio).

### US-11 - Lead capture and agent notification (Epic K)
As a potential seller, I want my contact details to be saved after I submit the estimate form, so that the agent can follow up with me.
As an agency agent, I want to receive an immediate notification (email and/or Telegram) for each new lead, so that I can promptly contact interested sellers.

Acceptance criteria:
- After form submission the lead (name, email, phone, address, estimate result, configId, timestamp) is saved to Firestore collection `leads/{configId}/submissions`.
- Firestore Security Rules allow `create` from any client but deny `read`, `list`, `update`, `delete` — data is write-only from the public internet.
- The agent receives an email notification with the lead details via a Firebase Cloud Function (Resend as email provider; SendGrid or Brevo as alternatives).
- Optionally, the Cloud Function also sends a Telegram message to the agent's configured chat ID.
- No API keys (email provider, Telegram bot token) are ever present in the client-side JS bundle — all secrets are stored as Firebase Function secrets.
- Submission is non-blocking: the estimate result is shown even if the Firestore write or notification fails; a non-blocking error message is shown on failure.
- The `name` field is added to the estimate form (required or optional, configurable per agency via `AgencyConfig`).
- `agentEmail` (and optionally `agentTelegramChatId`) are added to `AgencyConfig` to route notifications per agency.

### US-12 - Multi-agency support (Epic L)
As a product owner, I want a second fully operational agency config deployed, so that I can demonstrate the multi-tenant model to new clients.

Acceptance criteria:
- A second agency (e.g. `example-agency-milano`) is fully configured with its own zones, pricing model, branding, and privacy text.
- All existing features (admin, QR generation, estimate page, branding editor, estimation config editor) work for both agencies without any code change.
- E2e smoke tests cover the Milano agency flow end-to-end.

### US-13 - Estimate PDF export (Epic M)
As a potential seller, I want to download a branded PDF of my estimate, so that I have a document to review and share.

Acceptance criteria:
- After receiving the estimate result, a "Download PDF" button is visible.
- The downloaded PDF contains: agency logo, estimate min/mid/max, input summary, disclaimer, and agency contact info.
- The PDF uses the agency's branding palette.
- The download works on mobile (iOS Safari, Android Chrome) and desktop.

### US-14 - Admin leads dashboard (Epic N)
As an agency admin, I want to view, browse, and filter all submitted leads in the admin panel, so that I can manage follow-up without accessing Firestore directly.

Acceptance criteria:
- A leads list is accessible from `/admin/leads` (or as an admin tab).
- Leads are filterable by agency config and date range.
- Each entry shows: date, name, email, phone, address, estimate range.
- The admin can export the filtered list as CSV.
- Only leads for the selected agency config are shown by default.

### US-15 - Property type as a configurable estimation factor (Epic O)
As an agency admin, I want to define the list of available property types and assign a multiplicative coefficient to each, so that the estimate reflects the type of property without requiring a code deployment.
As a potential seller, I want to select the property type only when more than one is available, so that the form is as simple as possible.

Acceptance criteria:
- `AgencyConfig` supports an optional `propertyTypeFactors` map (propertyType → multiplier). When absent or when the factor is `1.0`, the estimate is unchanged (backward compatible with existing configs).
- The estimation engine applies `propertyTypeFactors[propertyType] ?? 1` as an additional multiplier in the Gabetti-style factor path.
- The estimate form shows the property type selector as the **first field**, only when `propertyTypes.length > 1`.
- The admin can edit `propertyTypeFactors` and the list of `propertyTypes` from the estimation config editor, using the same key-value UI pattern as other factor tables.
- Changes saved in admin are reflected immediately on the next estimate page load (override via localStorage/Firestore, same mechanism as other factors).
- Default config for new agencies: `propertyTypes: ['appartamento']`, `propertyTypeFactors: { appartamento: 1 }` — no user-visible change for Gabetti Busto Arsizio.

### US-16 - Fully admin-configurable estimation factor lists (Epic P) ✅
As an agency admin, I want to define the full list of options (with labels in IT/EN) and coefficients for every estimation factor — stato interno, piano, età di costruzione, accessori — directly from the admin UI, without modifying any code or redeploying.
As a potential seller, I want the form to show only the options that the agency has configured, with the labels the agency has chosen.

Acceptance criteria:
- Each estimation factor field (condition, floor, buildEra, accessories) is stored as an **open list** of entries, each with: `value` (string key), `label` (IT/EN), and `coefficient` (number — multiplicative for factors, additive for accessories).
- The TypeScript union types (`PropertyCondition`, `PropertyFloor`, etc.) are replaced by open `string` keys at the config level; the engine resolves coefficients by lookup, defaulting to `1` (or `0` for bonuses) when a key is not found.
- The admin can add, rename (label), reorder, and remove options for each factor list, using the same UI pattern as zones.
- The estimate form renders each field's options dynamically from the config — no hardcoded option lists in the component.
- Backward compatibility: existing Gabetti config migrates automatically; the static base config is updated to use the new open format.
- The estimation engine computes the result identically to today for configs that reproduce the current Gabetti factors.
- All acceptance, unit and component tests are updated or added to cover the new dynamic format.

_Notes for implementation:_
- `FactorEntry` replaces the current union-key tables: `{ value: string; label: Record<SupportedLocale, string>; coefficient: number }`.
- `AccessoryEntry` is the same but `coefficient` is additive (bonus €).
- Engine lookup: `config.conditionEntries?.find(e => e.value === input.condition)?.coefficient ?? 1`.
- Admin editor: each factor section becomes a list with add/edit/remove rows (same pattern as zones).
- Form labels for options come from `entry.label[locale]` instead of hardcoded i18n maps.
- The existing `i18n.ts` option maps become the **seed** for the static Gabetti config migration; they are no longer the source of truth at runtime.

### US-17 - Admin-configurable Sqm Bucket Prices and removal of legacy flat factor tables (Epic Q)
As an agency admin, I want to configure sqm bucket prices (price per sqm by surface range) as an editable open list with IT/EN labels, add/rename/reorder/remove options, directly from the admin UI.
As an agency admin, I no longer want to see the legacy flat-key editors for Condition Factors, Floor Factors, Era Factors, and Accessories Bonuses — those are now managed via the open-list entries editors (from Epic P).

Acceptance criteria:
- Sqm Bucket Prices is shown as an open-list editor with rows: value (e.g. "0-50"), label IT, label EN, price (€/sqm). Admin can add, rename, reorder, remove rows.
- The legacy flat-table sections (conditionFactors, floorFactors, eraFactors, accessoriesBonuses) are removed from the admin UI; only the Epic-P open-list editors are shown.
- The estimation engine resolves sqm price by looking up the correct bucket from the ordered entry list.
- All acceptance, unit and component tests updated or added.

### US-18 - Zone and property type reorder/remove in admin (Epic R)
As an agency admin, I want to reorder and remove zones and property types from the estimation config editor, using the same UX as factor entry lists (↑↓ buttons and ✕ remove).

Acceptance criteria:
- Each zone row has ↑ (move up) and ✕ (remove) buttons; the order is persisted on save.
- Each property type row has ↑ (move up) and ✕ (remove) buttons; the order is persisted on save.
- Removing a zone or property type removes it from the override; the engine and form reflect the change.
- All acceptance, unit and component tests updated or added.

### US-19 - Dynamic agency creation in admin (Epic S)
As an agency admin, I want to create a new agency directly from the admin panel without any code deployment, so that I can onboard a new client immediately.

Acceptance criteria:
- The admin page shows an "Add Agency" button that opens an inline name input form.
- Submitting an empty name shows a validation error.
- Submitting a valid name creates the agency, adds it to the agency list, auto-selects it, and opens its estimation config editor.
- The new agency persists after a page reload (stored in localStorage).
- For dynamic agencies, the estimation config editor shows an editable "Agency Name" field and sqm range (min/max) inputs; these are saved to the agency config on every save.
- The new agency's estimate page is immediately accessible at `/#/estimate/:configId`.
- All acceptance, unit and component tests cover the full lifecycle.

### US-20 - Cookie consent and GDPR compliance (Epic T)
As a seller landing on an agency estimate page, I want to be informed about cookie and privacy policy usage before any data is collected, so that my consent is explicit and legally compliant.

Acceptance criteria:
- On first visit to any public estimate page, a cookie consent banner is shown at the bottom of the screen.
- The banner contains: a short privacy notice (localized IT/EN), a link to the agency privacy policy (from `AgencyConfig.privacy.link` when present), an "Accept" button, and a "Decline" button.
- Clicking "Accept" stores `'accepted'` in `localStorage` under `hous4cast:cookieConsent` and hides the banner.
- Clicking "Decline" stores `'declined'` and hides the banner. The session continues normally.
- The banner is not shown again on subsequent visits if a consent value is already stored.
- No analytics or third-party tracking scripts are loaded before consent is `'accepted'`.
- The banner is not shown on admin routes (`/#/admin*`).
- The banner is fully keyboard-accessible and screen-reader friendly.

### US-21 - Admin authentication with Firebase Auth (Epic U)
As an agency admin, I want to log in to the admin panel with my email and password (or Google account), so that the admin area is protected from unauthorised access.

Acceptance criteria:
- The `/admin` route and all its sub-routes (`/admin/*`) are protected: an unauthenticated user is redirected to a `/admin/login` page.
- The login page contains an email+password form and a "Sign in with Google" button.
- A logged-in user's session persists across page reloads (Firebase `browserLocalPersistence`).
- A "Sign out" button is always visible at the top of the admin panel for a logged-in user.
- Firebase Authentication errors (wrong password, user not found, etc.) are shown inline and localised (IT/EN).
- No Firebase Auth SDK calls are made on public estimate pages (`/estimate/*`); authentication is strictly an admin concern.
- Firestore Security Rules for `branding/*`, `estimationConfig/*`, and `agencies/*` are updated to require `request.auth != null` for `write` operations; public `read` remains open.
- The Firestore `leads/{configId}/submissions` collection retains its write-open, read-closed rule (unchanged from Epic K).
- All secrets (Firebase config) stay in `.env` / Vite env vars; no new secrets are added to the client bundle.
- E2E tests cover: unauthenticated redirect to login, successful login with email+password, logout, protected route guard.
- Unit/component tests cover: `AuthGuard` redirect logic, login form validation, error display.

_Notes for implementation:_
- Enable **Email/Password** and optionally **Google** provider in Firebase Console → Authentication.
- New component `AuthGuard` wraps all `/admin` routes; reads `onAuthStateChanged` via a `useAuth` hook.
- New page `AdminLoginPage` with `signInWithEmailAndPassword` and `signInWithPopup(GoogleAuthProvider)`.
- `useAuth` hook (in `src/app/hooks/useAuth.ts`) exposes `{ user, loading }` from `onAuthStateChanged`.
- `AppRouter` wraps `<Route path="/admin/*">` inside `<AuthGuard>`.
- Firestore Security Rules update: `allow write: if request.auth != null` for admin-only collections.
- No server or backend change is needed — Firebase handles token validation.

### US-22 - GDPR right to erasure and per-agency Privacy Policy page (Epic V)
As a potential seller who has submitted my personal data via a hous4cast estimate form, I want to read the agency's full privacy policy and easily send a data erasure request, so that I can exercise my right to be forgotten under GDPR Art. 17.

Acceptance criteria:

**AC-1 — Privacy Policy page**
- A public route `/#/privacy/:configId` renders a full privacy policy page, branded with the agency palette (logo, colours) loaded from Firestore/localStorage (same mechanism as EstimatePage).
- The page displays the full privacy policy text in the currently active locale (IT or EN), loaded from `AgencyConfig.privacy.fullText`.
- If no `privacy.fullText` is configured, the page shows a default placeholder text (IT/EN, localised) that satisfies minimum GDPR disclosure requirements (data controller, purposes, retention period, rights).
- The locale switcher (IT/EN) is present and functional on the page.

**AC-2 — Footer link on EstimatePage**
- The estimate page (`/estimate/:configId`) renders a minimal footer containing a "Privacy Policy" link (label localised IT/EN).
- If `AgencyConfig.privacy.link` is set, the footer link opens that external URL in a new tab.
- Otherwise the footer link navigates to `/#/privacy/:configId`.
- The footer is visible on all states of the estimate page (before and after form submission).

**AC-3 — Erasure request via mailto**
- The Privacy Policy page displays a clearly labelled "Request data erasure" section (localised IT/EN).
- The section shows a `mailto:` link (button styled) pre-filled with:
  - **To:** `AgencyConfig.privacy.erasureEmail ?? AgencyConfig.agentEmail`
  - **Subject:** `[Privacy] Data erasure request – {agencyName}` (localised IT/EN)
  - **Body:** a short GDPR Art. 17 template (localised IT/EN)
- If neither `erasureEmail` nor `agentEmail` is configured, the erasure section is hidden and a fallback message invites the user to contact the agency directly.

**AC-4 — New config fields**
- `privacy.fullText: Record<SupportedLocale, string>` — full privacy policy text (IT/EN), admin-editable.
- `privacy.erasureEmail?: string` — optional dedicated erasure contact email; falls back to `agentEmail` if absent.
- Both fields are optional and backward-compatible; existing configs are unaffected.

**AC-5 — Admin editor**
- The estimation config editor gains a "Privacy Policy" section with:
  - Textarea for `privacy.fullText.it` and `privacy.fullText.en`.
  - Text input for `privacy.erasureEmail`.
  - Existing `privacy.link` inputs remain unchanged immediately above.
- All fields are saved to Firestore and localStorage as part of the existing `estimationConfig` override.

**AC-6 — Routing**
- `AppRouter` registers `/#/privacy/:configId` as a public route (no `AuthGuard`).
- Unknown `configId` shows the same "Config not found" error as EstimatePage.

**AC-7 — Localisation**
- All new UI strings (page title, section headers, erasure copy, mailto subject/body template, fallback placeholder, footer link label) are added to the `i18n` module for IT and EN.

**AC-8 — Tests**
- Unit/component: `PrivacyPolicyPage` renders full text, mailto link with correct href, fallback when `agentEmail` absent, placeholder when `fullText` absent.
- Component: `EstimatePage` footer renders correct link (internal vs. external) depending on `privacy.link`.
- Admin component: Privacy section saves `privacy.fullText` and `privacy.erasureEmail` correctly.
- E2e (Playwright): estimate page → click footer Privacy link → land on `#/privacy/:configId` → mailto link has correct `href`.

_Notes for implementation:_
- **Erasure mechanism: mailto link** — no Cloud Function, no new Firestore collection; GDPR-compliant for small agencies processing requests manually within 30 days.
- `PrivacyPolicyPage` loads config via `getConfigWithOverrides(configId)` and applies branding via the existing `useBranding` hook.
- Footer link resolution: `privacy.link` (external) takes precedence over internal `/#/privacy/:configId` — consistent with cookie consent banner (Epic T).
- If Epic K Cloud Functions are later operational, a future story can upgrade to an automated erasure request written to Firestore.

### US-19-imp - Admin UX improvements (Epic S+ — addendum to Epic S)
As an agency admin, I want the admin estimation config editor to be fully locale-aware, show contextual explanations for every field, allow me to delete agencies I no longer need, and present all configuration sections (including open-list factor entries) immediately when creating a new agency.

Acceptance criteria:
- Each dynamic agency card in the admin list shows a "✕ Delete" button; clicking it prompts a confirmation dialog and, on confirmation, removes the agency from the list and localStorage.
- When a new agency is created from the "Add Agency" form, all open-list sections (Condition Entries, Floor Entries, Era Entries, Accessory Entries, Sqm Bucket Entries) are immediately visible with a "+ Add" button, even before any entry is added.
- The "Sqm Range" inputs are displayed directly above the "Sqm Bucket Entries" section, forming a single logical block with a contextual hint that explains the three modes: bucket active (drop-down shown), bucket empty (numeric input shown), no bucket defined (numeric input shown).
- All section titles and labels in the estimation config editor respond to the app-level language switch (IT/EN).
- A short explanation of how each field affects the estimation calculation is displayed below each section title (formula and example in the current locale).
- The "Estimation Config" accordion toggle in AdminPage is localized (IT: "Configurazione stima", EN: "Estimation config").
- New agencies are created with generic placeholder values (`tipo_1`, `zona_1`) instead of Gabetti-specific identifiers.
- Factor select fields in the estimate form (condition, floor, era, accessories, sqm bucket) are hidden when the corresponding entries array is empty `[]`; they show options only when entries are configured.
- All hardcoded option maps (sqmBucketOptions, conditionOptions, etc.) are removed from `i18n.ts`; option labels live exclusively in the agency config entries.
- The estimation engine never throws for a missing or unconfigured sqm bucket — it falls back to `pricePerSqm × sqm`; all factors default to neutral values (×1/+0) when absent.
- `low` and `high` are always computed as `mid × (1 ± spread)` using the configured spread factor, never as hardcoded multipliers.

