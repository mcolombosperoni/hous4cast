# hous4cast

> A config-driven, white-label property valuation platform for real estate agencies.
> Sellers scan a QR code → fill a branded form → receive an instant price estimate.
> Agents manage everything — branding, pricing, zones — from a self-service admin panel.

---

## Documentation

| Document | Description |
|---|---|
| [AGENTS.md](./AGENTS.md) | Working agreement, testing rules, delivery workflow |
| [docs/project-plan.md](./docs/project-plan.md) | Epics, milestones, architectural decisions |
| [docs/task-board.md](./docs/task-board.md) | Task breakdown by epic and user story |
| [docs/user-stories.md](./docs/user-stories.md) | Full user stories with acceptance criteria |
| [docs/decisions/](./docs/decisions/) | Architecture Decision Records (ADR) |
| [docs/product-rationale.md](./docs/product-rationale.md) | Competitive analysis vs Tally, tech choices explained |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript (strict) |
| Styling | Tailwind CSS (mobile-first, dark mode) |
| Routing | React Router (hash mode — GitHub Pages compatible) |
| Forms | React Hook Form + Zod |
| Backend / DB | Firebase (Firestore + Authentication + Cloud Functions) |
| Images | Cloudinary (unsigned upload, parametric transforms) |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright (Chromium, Firefox, WebKit) |
| Hosting | GitHub Pages (tag-triggered deploy) |

---

## Local setup

```bash
cp .env.example .env
# fill in the required values (see Environment section below)

pnpm install
pnpm dev
```

---

## Quality checks

```bash
pnpm lint          # ESLint
pnpm type-check    # tsc --noEmit
pnpm test:run      # Vitest unit + component tests
pnpm build         # production build
pnpm test:e2e      # Playwright acceptance tests
```

All five checks must pass before pushing an increment.

---

## Release flow

1. Deliver an increment (epic complete, all tests green).
2. CI validates lint + type-check + unit tests + build on every push.
3. Demo and client approval happen outside CI.
4. From a clean `main` branch, run one release command:

```bash
pnpm release:patch   # 0.6.0 → 0.6.1
pnpm release:minor   # 0.6.0 → 0.7.0
pnpm release:major   # 0.6.0 → 1.0.0
```

5. The script bumps `package.json`, commits, tags `release/vX.Y.Z`, and pushes `main` + tag.
6. The tag-triggered GitHub Actions workflow runs the full quality gate and deploys to GitHub Pages.

---

## Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_BASE_PATH` | Base path for Vite build (e.g. `/hous4cast/` on GitHub Pages) |
| `VITE_PUBLIC_BASE_URL` | Public URL used for QR code generation |
| `VITE_ROBOTS_NOINDEX` | Set to `true` to inject `<meta name="robots" content="noindex,nofollow">` — use for staging/GitHub Pages to prevent search engine indexing |
| `VITE_FIREBASE_API_KEY` | Firebase project credentials (from Firebase Console) |
| `VITE_FIREBASE_AUTH_DOMAIN` | |
| `VITE_FIREBASE_PROJECT_ID` | |
| `VITE_FIREBASE_STORAGE_BUCKET` | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID` | |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional — Firebase Analytics |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (from dashboard top-left) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset name (Settings → Upload → Upload presets) |

> `VITE_APP_VERSION` is injected automatically at build time from `package.json` — do not set it manually.

> **GitHub Pages deployments** always set `VITE_ROBOTS_NOINDEX=true` via the workflow, so the staging site is never indexed by search engines.

---

## Architecture overview

```
Seller (QR scan)
  └─▶ /#/estimate/:configId
        ├─ loads AgencyConfig (static base + Firestore override + localStorage fallback)
        ├─ loads BrandingConfig (Firestore + localStorage fallback)
        ├─ renders branded form
        └─ on submit → EstimationEngine.estimate() → inline result

Admin (/#/admin)
  ├─ Agency list (static + dynamic from localStorage/Firestore)
  ├─ Branding editor → saves to Firestore branding/{configId}
  └─ Estimation config editor → saves to Firestore estimationConfig/{configId}
```

**Config resolution order (estimate page):**
1. Firestore override (`estimationConfig/{configId}`)
2. `localStorage` fallback (`hous4cast:estimationConfig:{configId}`)
3. Static base config (TypeScript file in `src/configs/`)

**Locale resolution order:**
1. `lang` query param
2. `dl` query param (from QR deep link)
3. `localStorage.preferredLocale`
4. `navigator.language` (normalised)
5. Fallback: `en`

---

## Firebase Cloud Functions

The notification feature (Epic K) uses Firebase Cloud Functions. They live in the `functions/` directory at the repo root, with their own `package.json`, `tsconfig.json`, and [README](./functions/README.md).

> ⚠️ **Firebase plan**: Cloud Functions require the **Blaze (pay-as-you-go)** plan. Set a billing budget alert in [Google Cloud Console](https://console.cloud.google.com/billing) to avoid unexpected charges. Typical agency volumes stay well within the free quota.

### Codebase structure

```
hous4cast/
├── src/                  ← Vite + React SPA
├── functions/            ← Firebase Cloud Functions (Node 20, TypeScript)
│   ├── src/index.ts      ← Function source
│   ├── lib/              ← Compiled JS output (git-ignored)
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md         ← Functions-specific docs (deploy, secrets, logs)
├── .github/workflows/
│   ├── release-pages.yml     ← Deploys SPA to GitHub Pages on release tag
│   └── deploy-functions.yml  ← Deploys Cloud Functions on release tag
└── firebase.json
```

### Deploy

**Functions are deployed automatically** by the `deploy-functions.yml` GitHub Actions workflow on every `release/*` tag — the same tags that trigger the SPA deployment. No manual `firebase deploy` from localhost.

To enable the workflow, add a `FIREBASE_SERVICE_ACCOUNT` secret to the GitHub repository:

1. Go to [Google Cloud Console → IAM → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=hous4cast)
2. Select `firebase-adminsdk-fbsvc@hous4cast.iam.gserviceaccount.com`
3. Click **Keys → Add Key → Create new key → JSON** — download the file
4. Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**
5. Name: `FIREBASE_SERVICE_ACCOUNT`, value: paste the full JSON content

### First-time IAM fix (one-off)

The first Cloud Functions deploy also requires the Cloud Build service account to exist and have the correct role. If the deploy fails with a permission error:

1. Go to [IAM → Grant Access](https://console.cloud.google.com/iam-admin/iam?project=hous4cast)
2. Add principal: `27465716194@cloudbuild.gserviceaccount.com`
3. Role: **Cloud Build Service Account** (`roles/cloudbuild.builds.builder`)
4. Save — then re-run the workflow

### Function secrets (Step 2+)

Function-level secrets (e.g. `RESEND_API_KEY`) are stored in Google Cloud Secret Manager, **not** in `.env` or GitHub Secrets. See [`functions/README.md`](./functions/README.md#secrets) for instructions.

---

## Notes

- Planning, decision records, and user stories are maintained in `docs/`.
- Keep `.env` out of git — only `.env.example` is committed.
- Never commit `dist/` or other build output.
