# Specify: Implementation Baseline (Verified Facts)

## Parent Phase

Specify — main document `specify.md`. All entries below were verified read-only on 2026-09-07, branch `feat/saas-mvp`, unless the source is marked as the calibration snapshot.

## Purpose

Record what actually exists in the repository today, separated from what the MVP must create, so later phases build on evidence rather than recollection.

## Details

### Exists today (verified facts)

1. `apps/` contains only `identity-cms`. `apps/api`, `apps/dashboard`, `apps/landing`, and `lib/` do not exist.
2. `apps/identity-cms` declares `@strapi/strapi`, `@strapi/database`, `@strapi/plugin-cloud` 5.52.3, `@strapi/plugin-users-permissions` 5.52.3, and `better-sqlite3` 12.8.0 (`apps/identity-cms/package.json`).
3. users-permissions is configured with `jwtManagement: 'refresh'` and `sessions.httpOnly: true` (`apps/identity-cms/config/plugins.ts`).
4. `config/database.ts` defaults `DATABASE_CLIENT` to `sqlite` and reads `DATABASE_HOST/PORT/NAME/USERNAME/PASSWORD/URL` plus SSL and pool variables from the environment.
5. `apps/identity-cms/.env.example` lists only HOST, PORT, APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, TRANSFER_TOKEN_SALT, JWT_SECRET, and ENCRYPTION_KEY; it omits the `DATABASE_*` variables that `config/database.ts` reads (incomplete example).
6. `apps/identity-cms/project.json` wires `develop`/`build`/`start` as `nx:run-commands` invoking `bun run` in that directory.
7. `apps/identity-cms/.env` exists locally and is git-ignored; no root `.env.example` exists.
8. `apps/identity-cms/database/migrations/` is empty (`.gitkeep` only); no seed files exist anywhere in `apps/` or `packages/`.
9. The root `README.md` contains only the title `# Smith`; it has no startup instructions.
10. Nx 23.2.0 workspace. Registered plugins: `@nx/vite/plugin`, `@nx/vitest`, `@nx/playwright/plugin` (e2e), `@nx/eslint/plugin`, `@nx/docker`, `@nx/next/plugin`. Not registered: `@nx/node` (declared as a devDependency but absent from `nx.json` plugins), `@nx/nest` and `@nx/react` (dependencies absent), Astro and Convex integrations (absent).
11. Root `package.json`: no `packageManager` field; empty scripts; dependencies include Angular 22, React 19, Next ~16.1.6, Express ^4.21.2; devDependencies include vitest ~4.1.0, `@vitest/coverage-v8`, `@playwright/test` ^1.36.0, TypeScript 6.0.3. No `@nestjs/*`, `astro`, or `convex` packages are declared.
12. `packages/` contains `api/products`, `shared/models`, `shop/{data, feature-products, feature-product-detail, shared-ui}` (the unwired Angular shop experiment); five co-located `*.spec.ts` files verified under `packages/*/src`.
13. `tsconfig.base.json` defines no `@org/*` path mappings, so `@org/*` imports in `packages/*` are unresolvable.
14. `nx.json` `release.projects` references `["api"]`; the only Nx project names found are products, models, data, feature-product-detail, feature-products, shared-ui, and identity-cms — the reference is dangling.
15. CI (`.github/workflows/ci.yml`): Node 24, `cache: 'npm'`, `npm ci`, `playwright install --with-deps`, targets `format:check` plus `lint test build typecheck e2e`, and Nx Cloud steps (`start-ci-run`, `record`, `fix-ci`).
16. No root `package-lock.json` exists; `bun.lock` is the only lockfile. No Playwright config file or e2e specification exists anywhere in the workspace.
17. `eslint.config.mjs` enables `@nx/enforce-module-boundaries`; `packages/*/project.json` files carry Nx scope/type tags; `vitest.config.mts` exists at the root (sources: direct read plus calibration snapshot, confidence 0.80-0.90).

### Must be created for the MVP (gaps; not statements about behavior)

- `apps/api` (NestJS), `apps/dashboard` (React + Vite), `apps/landing` (Astro), and the `lib/` shared-code home.
- Convex backend (schema/functions) for conversations and session history.
- MVP migrations/seed and seed data; complete `.env.example`; README startup instructions.
- Nx registrations/dependencies: NestJS, React-Vite, Astro, Convex, and `@nx/node` plugin registration if used.
- Playwright configuration and e2e specifications required by the CI gate.

### Known data-contract gaps (factual deficits today)

- G1. Storage contract undefined: meaning of "SQLite with Convex", conversation/session schema, and ownership fields (Open Item 1).
- G2. Auth contract undefined: token/session shape, role claims, and where the `admin` role lives (Open Item 4).
- G3. `.env.example` omits the `DATABASE_*` variables read by `config/database.ts` (verified fact; must be fixed by the deliverables).
- G4. No seed contract: seed scope, content, and store coverage are undefined anywhere in the repo.
- G5. Session-audit contract undefined: fields, filters, and permissions of the admin audit (Open Item 5).
- G6. e2e contract absent: CI enforces the target; no Playwright config or specs exist.
- G7. `@org/*` imports are unresolvable; MVP code must not touch those paths (Working Rule 4).

## Decisions Or Evidence

No decisions are made here. The facts and gaps above are evidence only; assumptions and open questions live in `specify-assumptions-and-open-questions.md`.

## Links

- Parent: `specify.md`
- Governance: `constitution.md` (Working Rules 1-9)
- Baseline snapshot: `spec-kit.mini/config.yaml`
