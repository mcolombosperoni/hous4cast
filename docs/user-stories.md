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

---

## Admin: configure agency palette, logo, and image

### Description
As an admin, I want to configure the agency color palette (primary, secondary, text, background), upload a cover image and a logo, through a modern, responsive interface optimized for mobile and desktop.

### Micro user stories
- As an admin, I want to select the agency primary color via color picker.
- As an admin, I want to select the agency secondary color via color picker.
- As an admin, I want to select the text color via color picker.
- As an admin, I want to select the background color via color picker.
- As an admin, I want to upload a cover image for the agency.
- As an admin, I want to upload the agency logo.
- As an admin, I want to see a real-time preview of the changes.
- As an admin, I want the interface to be responsive and use an accordion layout.

### UI Specifications
- Layout: accordion with three expandable sections: "Color palette", "Logo", "Image".
- Each section shows the relevant controls and a preview.
- Mobile: full-width accordion, one section open at a time.
- Desktop: accordion on the left, preview on the right.
- Color palette: fields for primary, secondary, text, background.

#### ASCII Wireframe
```
+-------------------+-------------------+
| > Color palette   |   [Preview]       |
| > Logo            |                   |
| > Image           |                   |
+-------------------+-------------------+
```

### Notes
- No additional data required at this time.
- The placement of image and logo on the estimate page will be defined later.
