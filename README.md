# hous4cast

Config-driven property estimation web app delivered through QR codes.

## Stack
- Vite + React + TypeScript (strict)
- Tailwind CSS (mobile-first)
- React Router (hash mode for GitHub Pages)
- Vitest + Testing Library
- Playwright (Chromium, Firefox, WebKit)

## Local setup
```bash
pnpm install
pnpm dev
```

## Quality checks
```bash
pnpm lint
pnpm type-check
pnpm test:run
pnpm build
pnpm test:e2e
```

## Release flow
1. Deliver incremental work by epic.
2. CI validates lint, type-check, tests, build.
3. Demo and approval happen outside CI.
4. Run one release command after approval:

```bash
pnpm release:patch
# or
pnpm release:minor
pnpm release:major
```

5. The command bumps `package.json`, commits, tags `release/vX.Y.Z`, and pushes `main` + tag.
6. Tag-triggered workflow publishes GitHub Pages.

## Environment
Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

- `VITE_BASE_PATH`: base path used by Vite build.
- `VITE_PUBLIC_BASE_URL`: public URL used for QR generation.
- `VITE_APP_VERSION`: injected at build-time from `package.json` version.

## Notes
Project planning and decision records are maintained in `docs/`.
