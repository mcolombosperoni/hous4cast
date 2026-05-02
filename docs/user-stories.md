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
As an agency agent, I want to receive an email notification for each new lead, so that I can promptly contact interested sellers.

Acceptance criteria:
- After form submission the lead (name, email, phone, address, estimate result, configId, timestamp) is saved to Firestore collection `leads`.
- The agent receives an email notification with the lead details.
- Submission is non-blocking: the estimate result is shown even if the lead save or email fails.
- The `name` field is added to the estimate form (required or optional, configurable per agency).

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
