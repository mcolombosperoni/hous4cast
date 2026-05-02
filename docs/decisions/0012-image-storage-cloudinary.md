# 0012 - Image storage via Cloudinary unsigned upload

## Status
accepted (supersedes image-storage decision in 0011)

## Context
Firebase Storage requires the Blaze (pay-as-you-go) plan and is not available on the free Spark plan.
The project runs on the Spark plan. A CORS-free, browser-compatible, free-tier image hosting solution
is needed for logo and cover image uploads from the admin UI deployed on GitHub Pages.

## Decision
Use **Cloudinary** for image storage:

- Upload method: **unsigned upload** via Cloudinary REST API (`POST /v1_1/{cloud_name}/image/upload`)
- No SDK dependency — plain `fetch` with `FormData`
- Only two public (non-secret) env vars required:
  - `VITE_CLOUDINARY_CLOUD_NAME` — the Cloudinary cloud name
  - `VITE_CLOUDINARY_UPLOAD_PRESET` — an unsigned upload preset configured in Cloudinary dashboard
- The API secret is **never exposed** in the frontend
- Returned `secure_url` is saved to Firestore as `logoUrl` / `coverImageUrl` (same as before)
- Fallback: when Cloudinary env vars are missing, base64 data URL is stored in localStorage only

## Security considerations
- Unsigned upload presets are intentionally public (same model as GitHub raw URLs)
- Mitigation in Cloudinary dashboard: restrict preset to folder `branding/`, allowed formats
  (png, jpg, svg, webp), max file size 2MB, no transformation rules
- Images are publicly accessible CDN URLs — acceptable for agency branding assets
- API secret is never in the frontend codebase

## Setup (one-time, per environment)
1. Create free account at https://cloudinary.com
2. Dashboard → Settings → Upload → Upload presets → Add upload preset
   - Signing mode: **Unsigned**
   - Folder: `branding`
   - Allowed formats: `png,jpg,jpeg,svg,webp`
   - Max file size: 2000000 (2MB)
3. Copy `cloud_name` from dashboard top-left
4. Add to `.env`:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=hous4cast_branding
   ```
5. Add same vars as GitHub Actions secrets for CI/CD deployment

## Consequences
- No Firebase Storage dependency — `firebase/storage` import removed
- `uploadBrandingImage` calls Cloudinary REST API directly
- `deleteBrandingImage` only clears Firestore/localStorage (Cloudinary free tier has no delete API)
- All tests mock `cloudinaryApi` — no real network calls in CI
- Firebase Storage bucket env var (`VITE_FIREBASE_STORAGE_BUCKET`) is kept for potential future use
  but Storage is no longer initialised

---

Refs: US-Admin, US-Admin-Image

