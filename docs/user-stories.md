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

