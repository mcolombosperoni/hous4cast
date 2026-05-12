# hous4cast — Firebase Cloud Functions

## Overview

Firebase Cloud Functions for hous4cast. Lives in `functions/` at the repo root, alongside `src/`.

- **Runtime**: Node 20
- **Language**: TypeScript (compiled to `lib/`, git-ignored)
- **Region**: `europe-west1` (Frankfurt — closest to Italian users)
- **Firebase plan required**: Blaze (pay-as-you-go) — see cost note below

---

## Cost note

All Cloud Functions usage stays within Firebase's **free quota** for typical agency volumes:
- Invocations: 2M/month free (a 100-lead/month agency uses ~100)
- Outbound networking: 5GB/month free

Set a [billing budget alert](https://console.cloud.google.com/billing) in Google Cloud Console (recommended: €5/month threshold) to be notified if usage ever grows unexpectedly.

---

## Testing

Unit tests live in `functions/src/index.test.ts` and run with **Vitest** (same version used by the SPA, but isolated inside `functions/`).

```bash
cd functions
npm test          # run once (CI mode)
npm run test:watch  # watch mode for development
```

The handler (`handleLeadNotification`) is extracted from the `onRequest` wrapper so it can be tested as a pure Node function without requiring a Firebase runtime. `firebase-functions/v2` and `firebase-functions/v2/https` are mocked via `vi.mock()`.

**Current test coverage (5 cases):**
- `GET` → 405 Method Not Allowed
- `PUT` → 405 Method Not Allowed
- `POST` with full payload → 200 `{ ok: true }`
- `POST` with empty body → 200 (scaffold does not validate payload shape)
- `POST` → `logger.info` called with the received payload

Tests run automatically in CI before every deploy — a failing test blocks the deployment.

---

## Local build (for development only)

```bash
cd functions
npm install
npm run build        # compiles TypeScript → lib/
npm run build:watch  # watch mode
```

> ⚠️ **Do not deploy from localhost.** All deployments go through the `deploy-functions.yml` GitHub Actions workflow triggered by `release/*` tags.

---

## Deploy (CI — the only way)

Functions are deployed automatically by `.github/workflows/deploy-functions.yml` when a `release/*` tag is pushed — the same event that deploys the SPA to GitHub Pages.

```bash
# From repo root — deploys SPA + functions
pnpm release:patch
```

### Setting up the workflow (one-time)

The workflow uses a Firebase service account key stored as a GitHub Secret.

1. Go to [Google Cloud Console → IAM → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=hous4cast)
2. Select `firebase-adminsdk-fbsvc@hous4cast.iam.gserviceaccount.com`
3. **Keys → Add Key → Create new key → JSON** — download the file
4. Go to **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**
5. Name: `FIREBASE_SERVICE_ACCOUNT`, value: paste the entire JSON file content
6. Save

### First-time IAM fix (one-off)

The first deploy activates the Cloud Build service account. If it fails with a permission error:

1. Go to [IAM → Grant Access](https://console.cloud.google.com/iam-admin/iam?project=hous4cast)
2. Add principal: `27465716194@cloudbuild.gserviceaccount.com`
3. Role: **Cloud Build Service Account** (`roles/cloudbuild.builds.builder`)
4. Save — then re-run the GitHub Actions workflow

---

## Secrets

Function-level secrets (API keys) are stored in **Google Cloud Secret Manager** — never in `.env`, GitHub Secrets, or source code.

```bash
# Set a secret (run once from repo root, requires firebase-tools installed)
firebase functions:secrets:set RESEND_API_KEY

# Verify
firebase functions:secrets:get RESEND_API_KEY
```

In function code, secrets are declared via `defineSecret()`:

```ts
import { defineSecret } from "firebase-functions/params";
const resendApiKey = defineSecret("RESEND_API_KEY");

export const sendLeadNotification = onRequest(
  { secrets: [resendApiKey], region: "europe-west1", cors: true },
  (req, res) => {
    const key = resendApiKey.value(); // available at runtime only
    // ...
  }
);
```

---

## Logs

```bash
# From repo root (requires firebase-tools)
firebase functions:log
firebase functions:log --only sendLeadNotification
```

Or view in [Google Cloud Console → Logging](https://console.cloud.google.com/logs?project=hous4cast).

---

## Current functions

| Function | Trigger | Step | Status |
|---|---|---|---|
| `sendLeadNotification` | HTTP POST | 1 — scaffold (logs payload, returns 200) | `todo — pending IAM fix` |

---

## Step roadmap

| Step | Description | Status |
|---|---|---|
| **1** | No-op scaffold — log payload, return 200. Validates infra and CI deploy pipeline. | `in-progress` |
| **2** | Call Resend API server-side → send HTML email to `agentEmail`. Requires `RESEND_API_KEY` secret. | `todo` |
| **3** _(optional)_ | Write lead to Firestore `leads/{configId}/submissions`. Requires Epic U (Firebase Auth) for per-agency read isolation. | `blocked` |

