# Apply: Execution Record — ai-saas-mvp

## Parent Phase

Plan — main document `plan.md`; tasks `plan-tasks.md`; validation `plan-validation.md`; risks/deferred `plan-risks-deferred.md`.

## Purpose

Record the progress of implementing the approved Plan tasks (A1..L1) in strict dependency order, with per-task status, work performed, validation evidence, and blockers. Owned exclusively by kit-apply. This file is the single execution record.

## Approval Gate

- Root specification `ai-saas-mvp.md` shows Plan Approved 2026-09-07 and Plan → Apply authorized 2026-09-07.
- `approval.md` verdict **APPROVED — 2026-09-07** (PASS 2, user explicit).
- Apply authorized to implement the pending tasks of the approved Plan only.

## Baseline (verified 2026-09-07, branch `feat/saas-mvp`)

- Toolchain: bun 1.3.14, node v24.15.0, npm 11.12.1, Nx 23.2.0.
- Root `package.json`: no `packageManager`; empty scripts; no `@nestjs/*`, `astro`, or `convex` deps.
- Root lockfile: `bun.lock` only; no `package-lock.json`.
- CI (`.github/workflows/ci.yml`): `actions/setup-node` (node 24, cache npm), `npm ci`, Nx Cloud `npx` steps, Playwright install, targets `format:check` + `lint test build typecheck e2e`, `npx nx fix-ci`.
- Nx projects: feature-product-detail, feature-products, shared-ui, models, products, data, identity-cms.
- `apps/` contains only `identity-cms`; `lib/` does not exist.
- `nx.json` `release.projects` = `["api"]` (dangling).
- `@nx/node` and `@nx/react` present in node_modules (23.2.0); `@nx/nest`, `@nestjs/*`, `astro`, `convex` NOT present.
- eslint `@nx/enforce-module-boundaries` active with scope:shared/shop/api and type:data constraints.
- vitest.config.mts root; co-located `*.spec.ts` convention in `packages/*/src`.

## Task Status

| ID | Status | Notes |
| :-- | :-- | :-- |
| A1 | done | `packageManager` bun@1.3.14 |
| A2 | done | CI migrated to bun (frozen lockfile + cache) |
| A3 | done | npm/dual-manager residue cleaned (write boundary) |
| B1 | done | Nx integrations available; Plan-vs-repo note re @nx/node registration |
| C1 | done | apps/api NestJS scaffolded |
| C2 | done | release.projects ["api"] now resolves; documented |
| C3 | done | apps/dashboard React+Vite scaffolded |
| C4 | done | apps/landing Astro scaffolded (explicit targets) |
| C5 | done | lib/contracts shared-code home + module boundaries |
| D1 | done | Strapi user/admin roles + default registration role (runtime validated 2026-09-07) |
| D2 | done | Session-integration surface (`apps/api` validates sessions via `/api/users/me`, resolves role server-side) + `GET /api/me` identity endpoint |
| I2 | done | Root `.env.example` created (AC13/G3 fixed; created early, self-contained) |
| E1 | done | `convex` dep added; codegen + function deploy validated against live deployment |
| E2 | done | Convex schema written (`apps/dashboard/convex/schema.ts`); codegen done |
| E3 | done | Convex queries/mutations written (`conversations.ts`, `audit.ts`); codegen + deployed |
| dev scripts | done | USER-REQUESTED (tied to I3): root `dev:api`/`dev:dashboard`/`dev:landing`/`dev:cms` + dependency-free parallel `dev:all` (`bash tools/dev-all.sh`); no combined `run-many -t dev serve` flaw |
| I1 | done | seed idempotent (Strapi + Convex); admin promotion verified in DB; welcome conversation seeded |
| I3 | done | README startup instructions grounded in dev scripts, seed, env, Convex login |
| K1 | done | co-located Vitest specs: session validation, role gates, lib contract, dashboard state logic, landing auth; landing mock hardened |
| F1 | done | dashboard chat view + conversation viewer/selector + model selector persisting modelId (per-user scoping) |
| F2 | done | provider-deferred placeholder on send; persists user message only; no simulated assistant content |
| F3 | done | empty/invalid/fallback states incl. explicit Convex-unavailable state; unauth redirect; empty-send blocked |
| F4 | done | dashboard auth wiring consuming the Strapi session established at landing |
| G1 | done | apps/api role-gated read-only audit endpoints (list users, list user conversations, read messages); no mutations |
| G2 | done | non-admin audit denial without data disclosure enforced at the API surface (403) |
| G3 | done | dashboard admin audit UI (read-only) per wireframe 3 consuming apps/api audit endpoints; no mutation controls |
| J1 | done | Playwright workspace config satisfying the CI `e2e` target (project=dashboard) |
| J2 | done | Playwright e2e specs covering S1–S6 (login; send+persist+placeholder; admin audit read-only; unauth redirect; non-admin denial; empty list) |
| L1 | done | FULL gate green via bun/Nx scoped per DECISION 1; single `bun.lock`; module-boundary lint ok; seed + README walkthrough ok |
| DECISION 1 | done | CI gate scoped to MVP projects (packages/* excluded); gate green |
| DECISION 2 | resolved | Convex auth + deployment verified in Apply env (codegen/deploy + seed validated) |

## Per-Task Log

### A. Package-manager governance

#### A1 — done
- **What**: Declared `"packageManager": "bun@1.3.14"` in root `package.json` (bun pinned to installed version; Q6/AC10).
- **Evidence**: `bun install --frozen-lockfile` exit 0 (no changes) — packageManager field does not invalidate `bun.lock`. `bun --version` = 1.3.14.

#### A2 — done
- **What**: Migrated `.github/workflows/ci.yml` npm→bun as ONE atomic canonical-manager change: replaced `actions/setup-node` (node 24, cache npm) + `npm ci` with `oven-sh/setup-bun@v2` (bun-version 1.3.14) + `bun install --frozen-lockfile`; added a bun install cache step (`actions/cache@v4`, keyed on `bun.lock`, path `~/.bun/install/cache`); moved setup-bun before the Nx Cloud `start-ci-run` so `bunx` is available; converted Nx Cloud and Playwright steps to `bunx` (`start-ci-run`, `record`, `run-many`, `fix-ci`, `playwright install`). Single-commit rollback: reverting this commit restores `actions/setup-node` + `npm ci`; no `package-lock.json` exists, so no dual-lockfile state (R6). Keep functional per R5.
- **Evidence**: `bun install --frozen-lockfile` exit 0 (3297 installs / 1836 packages, no changes, 2.47s). `bunx nx show projects` exit 0 (resolves local nx). Group A gate locally validated; full CI green re-verified at L1.

#### A3 — done
- **What**: Verified no npm/dual-manager residue in local targets/scripts/docs. Cleaned residue within write boundary: `apps/identity-cms/package.json` upgrade scripts `npx @strapi/upgrade` → `bunx @strapi/upgrade`; `apps/identity-cms/README.md` run commands `npm run`/`yarn` → `bun run` (develop/start/build/strapi deploy). `apps/identity-cms/project.json` already invokes `bun run`.
- **Evidence**: Grep across tracked non-skill, non-node_modules files for `npm ci|npm install|npm run|npx |yarn |package-lock` found only remaining refs in `tools/ai-migrations/@nx/eslint/23.1.0/` (Nx AI-migration tooling docs — outside write boundary/out of scope) and in skill/agent definition files under `.github/skills`, `.agents/skills`, `.claude/skills`, `.opencode/skills`, `.cursor/`, `agent/skills` (agent/skill config — write boundary forbids modifying these).

#### A. Gate validation (Group A complete)
- Frozen-lockfile install: `bun install --frozen-lockfile` → exit 0.
- Bun toolchain: `bunx nx show projects` → exit 0.
- AC10 partial: exactly one lockfile (`bun.lock`), no `package-lock.json`; `packageManager` declared.
- Group A gate (approval condition 3) locally satisfied; proceed to Group B.

### B. Nx integrations

#### B1 — done (with a Plan-vs-repo note)
- **What**: Installed/verified the missing integrations required by approved targets for Nx 23.2.0.
  - Added devDependency `@nx/nest@23.2.0` and runtime deps `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `reflect-metadata`; devDeps `@nestjs/schematics`, `@nestjs/testing`. `bun install` succeeded (45 packages).
  - `@nx/react@23.2.0`, `@nx/node@23.2.0` already present as devDeps.
  - Generated `apps/api` via `@nx/nest:application`, which registered `@nx/webpack/plugin` in `nx.json` (build/serve/preview inference) — required integration registration.
- **Plan-vs-repo note (NOT a spec gap, an implementation detail)**: baseline fact 10 / B1 phrase "register @nx/node in nx.json plugins". Verified that `@nx/node`, `@nx/react`, `@nx/nest` in Nx 23.2.0 expose NO `./plugin` export (`@nx/node/dist` has index/utils only; `@nx/react` exports only `.`, mf, babel, tailwind, webpack, etc.; `@nx/nest` exports `.`, package.json, migrations/generators, src). They are generator-based integrations that write project.json targets directly; `@nx/*:init` dry-run made no nx.json change. Therefore these plugins cannot be added to the nx.json `plugins` array (would break Nx discovery), and their "registration" is satisfied by the devDependency presence + generator usage. Astro and Convex have NO Nx plugin (verified `@nx/astro` and `@nx/convex` → npm 404), so they are wired via explicit `project.json` `nx:run-commands` targets per the identity-cms precedent (R1/Principle 3) in C4 and E1 respectively. No unrelated plugin adoption (WR2).
- **Evidence**: `bunx nx list @nx/nest` shows application/init/class/controller/etc. generators; `bunx nx list @nx/react` shows application/init/component; `bunx nx list @nx/node` shows application/init. `nx show project api` lists targets lint/test/build/serve (webpack inference).

#### Pre-existing repo risk (recorded for L1 / orchestrator)
- `packages/*` (FROZEN per Q7/WR4/AC11, must not be modified) has a PRE-EXISTING typecheck failure: `products:typecheck` fails with `TS2307: Cannot find module '@org/models'` (`packages/api/products/src/lib/products.service.ts:1`). Baseline fact 13 confirms `tsconfig.base.json` has no `@org/*` path mappings, so these `@org/*` imports are unresolvable. This is unrelated to any Apply change (verified: no `packages/` files modified by Apply; the error is a tsconfig path-mapping issue). The CI gate `nx run-many -t lint test build typecheck e2e` runs across ALL projects, so this pre-existing failure means the L1 "full gate green" cannot be satisfied without either (a) modifying frozen `packages/*` (forbidden), or (b) excluding frozen `packages/*` from the CI gate (a Plan/CI decision not authorized here). **Needs orchestrator/user decision.**

### C. Scaffolding + shared code

#### C1 — done
- **What**: Scaffolded `apps/api` (NestJS) via `bunx nx g @nx/nest:application --name=api --directory=apps/api --linter=eslint --unitTestRunner=vitest --e2eTestRunner=none --strict --tags=scope:app,type:app --useProjectJson --skipFormat`. Generator registered `@nx/webpack/plugin` in nx.json and created `src/main.ts`, `src/app/{app.module,app.controller,app.service}.ts`, co-located specs, `tsconfig.{app,spec}.json`, `vitest.config.mts`, `eslint.config.mjs`, `webpack.config.js`, `project.json`. Added a `typecheck` target (`tsc --noEmit -p tsconfig.app.json`) to satisfy C1's lint/test/build/typecheck requirement.
- **Evidence**: `nx run api:typecheck` exit 0; `nx run api:lint` exit 0; `nx run api:test` exit 0 (co-located specs); `nx run api:build` exit 0 (webpack compiled successfully; benign "Bun lockfile generation is not supported" notice). `nx show project api` name=api root=apps/api.

#### C2 — done (no edit needed; documented, never silent per A8)
- **What**: Verified the `nx.json` `release.projects: ["api"]` dangling reference (baseline fact 14) now resolves to the real scaffolded project. The scaffolded project name is `api` (root `apps/api`), which matches `release.projects: ["api"]` exactly — so no nx.json edit is required; the reference is no longer dangling.
- **Evidence**: `release.projects` = `['api']`; `nx show project api` → name=api, root=apps/api. Documented here per A8 (never silent).

#### C3 — done
- **What**: Scaffolded `apps/dashboard` (React + Vite) via `bunx nx g @nx/react:application --name=dashboard --directory=apps/dashboard --style=css --bundler=vite --linter=eslint --unitTestRunner=vitest --e2eTestRunner=none --tags=scope:app,type:app --useProjectJson --useReactRouter --skipFormat`. Generator added `@nx/react` generator defaults to nx.json. Targets inferred by `@nx/vite/plugin`/`@nx/vitest`/`@nx/eslint/plugin`: build, dev, serve, preview, serve-static, lint, test, typecheck (no app-level e2e — Playwright handled separately in J1).
- **Evidence**: `nx run dashboard:lint` exit 0; `nx run dashboard:typecheck` exit 0; `nx run dashboard:test` exit 0; `nx run dashboard:build` exit 0. `nx show project dashboard` targets = build, build-deps, dev, lint, preview, serve, serve-static, test, typecheck, watch-deps.

#### C4 — done
- **What**: Scaffolded `apps/landing` (Astro) per B1 outcome (no `@nx/astro` plugin). Added `astro@^7.3.1`, `@astrojs/check@^0.9.10`, `eslint-plugin-astro@^3.1.0` to root package.json (single-install monorepo). Created `apps/landing/astro.config.mjs`, `tsconfig.json` (extends `astro/tsconfigs/strict`), `src/pages/index.astro` (value proposition + login/register two-mode panel per wireframe 1, client-side auth, generic error without user enumeration), `src/lib/auth.ts` (login/register against Strapi users-permissions, testable module), `eslint.config.mjs` (astro flat config + ignores for generated `.astro/`/`dist`), and `project.json` with explicit `nx:run-commands` targets `dev`/`build`/`start`/`typecheck` (`bunx astro dev/build/preview/check`) following the identity-cms precedent (R1/Principle 3/WR2).
- **Evidence**: `nx run landing:build` exit 0 (1 page built); `nx run landing:typecheck` exit 0 (astro check); `nx run landing:lint` exit 0. `src/lib/auth.ts` is a K1 test candidate.

#### C5 — done
- **What**: Created `lib/contracts` as the MVP shared-code home via `bunx nx g @nx/js:library --name=contracts --directory=lib/contracts --linter=eslint --unitTestRunner=vitest --bundler=tsc --strict --tags=scope:mvp-shared,type:lib --useProjectJson`. Populated `src/lib/contracts.ts` with the canonical data contract (Conversation, Message, ConversationSummary, UserRole, MessageRole, ModelId) plus `isUserRole`/`isMessageRole` type guards; updated `contracts.spec.ts` to test them. Added a `typecheck` target.
- **AC11 alignment**: the generator created `@org/contracts` path mapping; renamed the lib package to `@mvp/contracts` and the `tsconfig.base.json` path to `@mvp/contracts` so MVP code does NOT import `@org/*` (AC11). Extended `@nx/enforce-module-boundaries` depConstraints in `eslint.config.mjs` for the new MVP scopes: `scope:mvp-shared → onlyDependOnLibsWithTags: ['scope:mvp-shared']`; `scope:app → onlyDependOnLibsWithTags: ['scope:app', 'scope:mvp-shared']`. This keeps shared code independent of app code and forbids apps/lib from importing frozen `packages/*` (scope:shared/shop/api) — satisfying Q7/WR3-4/AC11.
- **Evidence**: `nx run contracts:lint` exit 0; `contracts:test` exit 0; `contracts:build` exit 0; `contracts:typecheck` exit 0. Verified AC11 both ways: (a) `@mvp/contracts` import into `apps/api` passes `api:lint` (scope:app→scope:mvp-shared allowed); (b) a relative import of `packages/api/products` fails `api:lint` with `@nx/enforce-module-boundaries` ("Projects cannot be imported by a relative or absolute path..."). Test file reverted after verification.

#### C. Group C gate validation (partial)
- apps/api, apps/dashboard, apps/landing, lib/contracts all scaffolded; per-project lint/test/build/typecheck verified green.
- `nx.json` `release.projects: ["api"]` now resolves to the real `api` project (C2).
- Deferred items absent from tree so far (no agent-router/agent-runtime/session-revocation/Angular-retirement/CMS-seed code).

### D. Strapi completion

#### D1 — done (code written; runtime validation pending)
- **What**: Implemented a `bootstrap` in `apps/identity-cms/src/index.ts` that (a) ensures the `user` and `admin` end-user roles exist in `plugin::users-permissions.role` (copying permissions from the plugin's default `authenticated` role when present), and (b) sets the users-permissions `advanced.default_role` to `user` so registration always creates a `user`-role account. `admin` is assigned only via the seed (I1). These are end-user roles, distinct from Strapi Panel super-admins (Q3/R4; AC4-AC7).
- **Validation status**: The code compiles but requires a running Strapi to exercise the bootstrap (creates DB roles + plugin-store setting). Marked pending runtime validation; the existing `config/plugins.ts` already has `jwtManagement: 'refresh'` and `sessions.httpOnly: true` (baseline fact 3).

#### D2 — in progress (session-integration surface)
- **What**: Confirmed the plugin-managed refresh + httpOnly session config is already present (`apps/identity-cms/config/plugins.ts`: `jwtManagement: 'refresh'`, `sessions.httpOnly: true`). Verified via the plugin source that in `refresh` mode the access token is minted by the Strapi `sessionManager` (`generateAccessToken`), validated by `validateAccessToken`, and resolves to `{ id: user.id, sessionId }`. This means `apps/api` must resolve the end-user role separately from the token (the refresh-mode access token carries `userId`/`sessionId`, not the role claim) — a key design point for the role gate (G1). `apps/api` session validation + role-gate enforcement are implemented in G1 (depends: D1, C1).
- **Note for G1**: role identification requires either querying the Strapi user role server-side or including the role in the session resolution; the exact mechanism is implemented with the audit endpoints.

### E. Convex backend

#### E1 — done
- **What**: Added `convex@^1.45.0` to root package.json (single-install monorepo). Documented the hosted-service dependency, required env vars (`CONVEX_URL`, `CONVEX_DEPLOYMENT` in `.env.local`, `CONVEX_DEPLOY_KEY` — in `.env.example`), and dev CLI workflow (`bunx convex codegen`, `bunx convex dev`, `bunx convex deploy`, `bunx convex login`). The unavailable-persistence fallback (E1) renders an explicit unavailable state in the dashboard (implemented in F3) — no silent message loss.
- **Deployment state (2026-09-08)**: `~/.convex/config.json` present; root `convex.json` → `apps/dashboard/convex/`; root `.env.local` has `CONVEX_DEPLOYMENT=dev:elegant-leopard-820` (team moisestuberquia, project smith). Convex CLI commands MUST run from the repo root (where `convex.json`/`.env.local` live) — running `bunx convex codegen` from `apps/dashboard` fails with "No CONVEX_DEPLOYMENT set". Recorded as an invocation note.
- **Validation**: `bunx convex codegen` (from repo root) exit 0 — generated bindings unchanged (already current) and functions re-uploaded. `bunx convex function-spec` exit 0 confirms all 8 functions deployed:
  - `conversations.js:createConversation` (Mutation), `conversations.js:listOwnConversations` (Query), `conversations.js:getConversation` (Query), `conversations.js:listMessages` (Query), `conversations.js:sendMessage` (Mutation), `conversations.js:updateModelId` (Mutation)
  - `audit.js:auditListUserConversations` (Query), `audit.js:auditListMessages` (Query)
- **Typecheck**: `bunx nx run dashboard:typecheck` exit 0 (E2/E3 functions typecheck against `_generated/`).

#### E2 — done (code written; codegen pending)
- **What**: Wrote `apps/dashboard/convex/schema.ts` with `conversations` (ownerUserId, title, modelId, createdAt, updatedAt; index `by_owner`) and `messages` (conversationId, role `user`|`assistant`, content, createdAt; index `by_conversation`) per the canonical contract (Q1). Maps `Conversation`/`Message` contract fields to Convex tables (`_id` is the id). No SQLite chat writes anywhere (AC2).
- **Validation**: requires `bunx convex codegen` (needs deployment) to typecheck `_generated/`.

#### E3 — done (code written; codegen pending)
- **What**: Wrote `apps/dashboard/convex/conversations.ts` (dashboard direct-client flow, per-user scoped by `ownerUserId`: `createConversation`, `listOwnConversations`, `getConversation`, `listMessages`, `sendMessage` (persists `user` message only, bumps `updatedAt`), `updateModelId`) and `apps/dashboard/convex/audit.ts` (read-only admin audit path: `auditListUserConversations` with metadata+messageCount, `auditListMessages`). Dashboard chat never passes through NestJS (Q2); audit is read-only, no mutation ops (Q4/AC6).
- **Validation**: requires `bunx convex codegen` (needs deployment) to typecheck `_generated/`; deployed via `bunx convex deploy`.

### I. Deliverables (started early — see note)

#### I2 — done (created early; self-contained)
- **What**: Created root `.env.example` enumerating every variable required to start/test/seed/operate the MVP: Strapi server + secrets + all `DATABASE_*` vars (fixes G3/AC13), Convex (`CONVEX_URL`, `CONVEX_DEPLOY_KEY`), apps/api (`API_PORT`, `STRAPI_URL`, `API_JWT_SECRET`), apps/dashboard (`VITE_CONVEX_URL`, `VITE_STRAPI_URL`), apps/landing (`PUBLIC_STRAPI_URL`, `PUBLIC_DASHBOARD_URL`), and seed credentials. Safe non-secret placeholders; no committed secrets.
- **Note**: Per plan, I2 depends on D1+E1. Created early because it is a self-contained documentation deliverable and the variable set is fully determined by the confirmed decisions (Q1/Q6/Q8, G3). Final completeness re-verified at L1 (AC13).

### Resume session — user-requested dev scripts + unblocked deliverables

#### Dev scripts (USER REQUESTED — tied to I3) — done
- **What**: Added root `package.json` scripts to start each app in dev mode (bun canonical, per-app). Verified actual serve/dev target names via `bunx nx show project <name> --json` before wiring: api=`serve`, dashboard=`dev`, landing=`dev`, identity-cms=`develop`.
  - `dev:api` → `nx serve api`
  - `dev:dashboard` → `nx dev dashboard`
  - `dev:landing` → `nx dev landing`
  - `dev:cms` → `nx develop identity-cms`
- **Combined `dev`**: skipped per Principle 2 / orchestrator guidance. Nx auto-added a combined `dev` = `bunx nx run-many -t dev serve -p landing dashboard api identity-cms`, which is flawed (runs BOTH `dev` and `serve` on dashboard → duplicate/port conflict; doesn't cleanly cover api/landing/cms). Removed it in favor of clean per-app scripts.
- **Evidence (each launches)**:
  - `bun run dev:api` → NestJS "Nest application successfully started", route `{/api, GET}` mapped.
  - `bun run dev:dashboard` → `VITE v8.0.9 ready`, `Local: http://localhost:4200/` (benign nxViteTsPaths/nxCopyAssetsPlugin deprecation warnings).
  - `bun run dev:landing` → `Dev server running at http://localhost:4321`.
  - `bun run dev:cms` → Strapi `Project information` + `Strapi started successfully` (http://localhost:1337).

#### `dev:all` — one-command parallel dev launcher (same user-requested dev-scripts bucket / I3) — done
- **What**: Added a dependency-free `bun run dev:all` that launches the four MVP dev servers in parallel so the whole stack runs with a single command (user explicitly approved "si").
  - Root `package.json`: `"dev:all": "bash tools/dev-all.sh"`.
  - `tools/dev-all.sh`: backgrounds the four EXISTING root scripts (single source of truth — no raw `nx ...` target strings re-encoded here) and `wait`s:
    `bun run dev:api & bun run dev:dashboard & bun run dev:landing & bun run dev:cms & wait`.
  - Exactly one process per app. The prior combined `dev` flaw (`run-many -t dev serve` ran BOTH `dev` and `serve` on the dashboard → duplicate process / port-4200 conflict) was NOT reintroduced.
  - `dev:all` is a dev-server launcher ONLY — it does NOT start Convex and does NOT run the seed. The manual prerequisites (env files from templates; Convex `bunx convex dev` from repo root; Strapi up before `bun run seed`) are documented in the script header comment and in README's "Running each app (dev mode)".
- **Dependency / cross-platform tradeoff**: NO new dependency was added (AC10 safe). The mechanism is POSIX `bash` backgrounding + `wait`. This repo is bun canonical + ubuntu-latest CI, so the POSIX approach is acceptable; a Windows `cmd`/`powershell` equivalent would differ, but Windows is out of scope for the CI orientation — recorded here, not silently worked around with `concurrently`/`npm-run-all`. Escalation not required: no dependency was needed.
- **Validation evidence**:
  - `bun install --frozen-lockfile` → exit 0 (no changes; 3684 installs / 2207 packages) — AC10 preserved, no locked-file/dependency drift.
  - Live `dev:all` run (bounded, self-terminated after observation): all four ports bound SIMULTANEOUSLY — snapshot showed `1337` (Strapi), `4321` (Astro/landing), `4200` (Vite/dashboard), `3000` (NestJS/api); all four detected within ~50s of launch. Ready lines observed: Vite "ready" + `Local: http://localhost:4200/` (exactly one `ready in` / one Local:4200 — single dashboard process); Nest "Nest application successfully started" + "running on: http://localhost:3000/api"; Astro "Dev server running at http://localhost:4321"; Strapi "Strapi started successfully". No `EADDRINUSE` / "already in use" / port-4200 conflict lines (scan = 0). Servers stopped after observation; ports reclaimed.
  - Gate re-run (nothing regressed): `bunx nx run-many -t lint test build typecheck --projects=api,dashboard,landing,identity-cms,contracts` → exit 0 (18 tasks); `bunx nx format:check --base="remotes/origin/main" --projects=api,dashboard,landing,identity-cms,contracts` → exit 0.
  - Lockfile: root `bun.lock` only, no `package-lock.json`. Note: `apps/identity-cms/bun.lock` (nested Strapi app bun lockfile, pre-existing) and `./.opencode/package-lock.json` (opencode tooling, not a project dependency lockfile) exist but are not dependency-manager drift; the canonical root `bun.lock` (AC10) is unchanged. `package.json`/`README.md` are within prettier scope and `format:check` passed.
- **Files**: root `package.json` (added `dev:all`), `tools/dev-all.sh` (new), `README.md` (`dev:all` row + ordering caveat). No other file changed.

#### D1 — runtime validation evidence (Blocker #3 resolved for D1)
- Started `bunx nx develop identity-cms` locally; Strapi started (sqlite, `.tmp/data.db`). Verified the bootstrap via the DB:
  - `up_roles` now contains `3 | user | user` and `4 | admin | admin` (plus default `Authenticated`/`Public`).
  - `plugin_users-permissions_advanced` store setting = `{"default_role":"user"}`.
  - Registration therefore creates `user`-role accounts (AC4-AC7); admin role is assigned only via the seed.
- Fixed a TS error found at runtime: `advanced.default_role` on type `{}` → typed `advanced` as `{ default_role?: string }` in `apps/identity-cms/src/index.ts`. Strapi then compiles and starts.

#### I3 — done
- **What**: Wrote root `README.md` with startup instructions: architecture table, prerequisites (Node 24, bun), `bun install`, env setup (`.env` + `apps/identity-cms/.env` from templates), Convex login/codegen/dev step (hosted service), per-app run commands (grounded in the new dev scripts + ports), seed command, testing commands, and notes (frozen `packages/*`, provider-deferred placeholder, Convex unavailable state).

#### I1 — done (Strapi + Convex; idempotent)
- **What**: Created `tools/seed/seed.ts` + root `"seed": "bun tools/seed/seed.ts"`. Strapi side: registers 1 admin + >=2 regular users via `/api/auth/local/register` (all get the `user` role per D1), then promotes the admin user to the `admin` end-user role via the users-permissions admin API (requires `STRAPI_ADMIN_API_TOKEN`, added to `.env.example`). Convex side: guarded by `CONVEX_URL`; creates a welcome conversation + messages via the Convex client (execution requires the configured deployment).
- **I1 hardening (idempotency fix, 2026-09-08)**: re-running the seed with pre-existing users previously never promoted the admin (registerUser returned null on 400 and promoteToAdmin was only called on registration success). Fixed:
  - `ensureUser` resolves an existing user by username/email via `GET /api/users?filters[username][$eq]=…` / `[email][$eq]=…` (users-permissions admin API, token now available) before attempting registration.
  - `promoteToAdmin` now runs for the admin user REGARDLESS of whether registration succeeded or the user pre-existed, and is a no-op when the user is already `admin` (reads `GET /api/users/:id?populate=role` first).
  - Convex welcome-conversation seeding is idempotent: `listOwnConversations` is checked first and the seed skips when a "Welcome conversation" already exists.
- **Route correction found at runtime**: user CRUD lives at `/api/users/*` (NOT `/api/users-permissions/users/*`, which 404s/405s). `PUT /api/users/:id` with `{ role }` promotes the role; `?populate=role` exposes it. `GET /api/users-permissions/roles` returns `{ roles }` with the `admin` type. Recorded so the seed and G1 use the correct paths.
- **Validation** (Strapi running on :1337, sqlite `.tmp/data.db`):
  - `bun run seed` exit 0. First run: "User admin already exists (id 1)." → "Promoted user 1 to the admin role."; users `user`/`user2` resolved as existing. Second run: "User 1 is already an admin — no change needed." (idempotent).
  - DB verified: `sqlite3 .tmp/data.db "SELECT u.id, u.username, r.name FROM up_users u LEFT JOIN up_users_role_lnk l ON l.user_id=u.id LEFT JOIN up_roles r ON r.id=l.role_id;"` → `1|admin|admin`, `2|user|user`, `3|user2|user`. **Admin user (id 1) now has the `admin` role.**
  - Convex: `bunx convex data conversations` → 1 "Welcome conversation" (ownerUserId `seed-user`); `bunx convex data messages` → 3 messages. Re-run: "Welcome conversation already exists (id …) — skipping." (no duplicate).
  - **DECISION 2 resolved**: Convex auth + deployment verified in the Apply env; codegen/deploy/seed all work.

#### K1 — partial (unblocked units)
- **What**: Added `apps/landing/vitest.config.mts` and `apps/landing/src/lib/auth.spec.ts` (4 tests: login success/failure generic-error, register success/failure generic-error — S1/AC4 no-user-enumeration). `@nx/vitest` auto-inferred the landing `test` target.
- **Evidence**: `nx run landing:test` → 1 file / 4 tests passed. `landing:lint` exit 0, `landing:typecheck` exit 0.
- **Blocked units**: session validation, role gates, Convex function contracts, dashboard state logic — require F/G (Convex codegen), so K1 for those is pending.

## Blocker / Gap Register

### DECISION 1 — RECORDED (user authority, 2026-09-07) — packages/* excluded from validation gate
- **Decision (verbatim intent)**: The CI gate and L1 final validation apply ONLY to the MVP projects (api, dashboard, landing, identity-cms, lib/*) — i.e. everything except the frozen `packages/*` Angular experiment. This resolves the Constitution WR4 (frozen/isolation) vs WR8 (full CI gate) ambiguity escalated per constitution Notes. `packages/*` files remain UNTOUCHED (no repair, no deletion, no `@org/*` wiring).
- **Mechanism chosen**: explicit `--projects=api,dashboard,landing,identity-cms,contracts` on both the `run-many` gate targets and `format:check` (simplest, most readable; Principle 2). Project names verified via `bunx nx show projects` (the frozen projects are feature-product-detail, feature-products, shared-ui, models, products, data; the root `@org/source` project is also excluded since it is not an MVP project).
- **ci.yml change**: `- run: bunx nx run-many -t lint test build typecheck e2e --projects=api,dashboard,landing,identity-cms,contracts` and `- run: bunx nx record -- bunx nx format:check --base="remotes/origin/main" --projects=api,dashboard,landing,identity-cms,contracts` (with an explanatory comment citing the decision).
- **Gate fix (in scope for identity-cms)**: identity-cms had an inferred `lint` target (`eslint .`) with no eslint config; it failed on Strapi's auto-generated `types/generated/contentTypes.d.ts` (`@typescript-eslint/no-empty-object-type`). Added `apps/identity-cms/eslint.config.mjs` (extends root config, ignores generated `types/generated`, `dist`, `build`, `node_modules`, `public/uploads`). Warnings (non-null assertion / unused var) do not fail the gate.
- **format:check**: added generated dirs (`**/.astro`, `**/.strapi`, `**/types/generated`, `**/dist`, `**/build`) to `.prettierignore`; ran `bunx prettier --write` on MVP source files (package.json, nx.json, tsconfig.base.json, eslint.config.mjs, README.md, apps/*, lib/*). Non-code files (.gitkeep, .env.example, robots.txt) have no prettier parser and are outside the gate.
- **Local gate evidence** (MVP scope):
  - `bunx nx run-many -t lint test build typecheck e2e --projects=api,dashboard,landing,identity-cms,contracts` → **exit 0** ("Successfully ran targets lint, test, build, typecheck for 5 projects"; `e2e` runs 0 tasks until J1). Confirmed packages/* projects (feature-product-detail, feature-products, shared-ui, models, products, data) did NOT participate.
  - `bunx nx format:check --base="remotes/origin/main" --projects=api,dashboard,landing,identity-cms,contracts` → **exit 0**.

### DECISION 2 — Convex auth detection (2026-09-07) — NOT AVAILABLE in Apply environment
- Detection evidence: `bunx convex codegen` in `apps/dashboard` → `✖ No CONVEX_DEPLOYMENT set, run npx convex dev to configure a Convex project`; with `CONVEX_DEPLOYMENT=dev:local` → `✖ Error fetching GET https://api.convex.dev/api/deployment/local/team_and_project 401 Unauthorized: MissingAccessToken` ("Authenticate with npx convex dev"). No `convex.json`, no `~/.convex`, no `~/.config/convex`, no `CONVEX_DEPLOYMENT`/`CONVEX_URL` env var in the shell, and no `bunx convex whoami` command. Conclusion: the user's `bunx convex login`/`bunx convex dev` state is NOT reflected in this session; the Convex client requires generated `FunctionReference` types (string operation names do not typecheck).
- **Consequence**: F1–F4, G1–G3, I1 (Convex side), J1–J2, and L1 remain BLOCKED on Convex `codegen`/deployment. User must confirm `bunx convex login` completed and that a deployment is configured (`CONVEX_DEPLOYMENT` set / `convex.json` present), then re-run so `bunx convex codegen` succeeds.

### Pre-existing / deferred note
- **Strapi admin-promotion for the seed**: requires `STRAPI_ADMIN_API_TOKEN` (users-permissions API token created in the Strapi admin panel) — documented in `.env.example`; local panel-admin password is unknown so it could not be auto-provisioned.

### G1/D2 design finding — Strapi role resolution (recorded for G1 implementation)
- Verified against a running Strapi 5.52.3 (`apps/identity-cms`, sqlite) with seeded users:
  - `POST /api/auth/local` returns `jwt` + user; the access-token JWT payload is `{ userId, sessionId, type: 'access', iat, exp }` — **no role claim** (confirms D2 note; the refresh-mode access token carries userId/sessionId only).
  - `GET /api/users/me` (with `Authorization: Bearer <token>`) returns the user WITHOUT `role`; `?populate=role` / `?populate=*` also return no role (Strapi 5 `me` controller uses the user service `fetch` + `sanitizeQuery`, which does not populate the role relation; the role is populated only by `fetchAuthenticatedUser`, not used by `me`).
- **Implication for G1**: `apps/api` must resolve the end-user role server-side, NOT from the access token or `/api/users/me`. Candidate approaches to finalize during G1: (a) call the users-permissions admin API (`GET /api/users-permissions/users/:id`) with `STRAPI_ADMIN_API_TOKEN` to read the role; or (b) extend the D1 bootstrap to expose the role via a Strapi service/endpoint. This is a design decision within G1 scope, not resolved here (G1 is Convex-blocked).

### G1 role-resolution DECISION (2026-09-08) — candidate (a) selected
- **Decision**: resolve the end-user role server-side in `apps/api` via the users-permissions admin API using `STRAPI_ADMIN_API_TOKEN` (candidate a). No new Strapi service/endpoint is added.
- **Rationale**: The route is verified working against the live Strapi 5.52.3 instance. Two concrete, already-confirmed endpoints cover the whole audit flow with the existing admin token:
  - `GET /api/users/:id?populate=role` → returns the user with `role.type` (`user`|`admin`) — used for the session→role resolution in `SessionGuard`.
  - `GET /api/users?populate=role` → returns all users with roles — used for the audit "list users" endpoint.
  - `GET /api/users/me` (with the caller's access token) → validates the session and yields `{ id, username, email }` without credentials handling (D2).
- **Route correction (verified at runtime)**: users-permissions user CRUD lives at `/api/users/*` (NOT `/api/users-permissions/users/*`, which 404s/405s). This corrects the earlier seed/G1 note that referenced `/api/users-permissions/users/:id`; the PUT promotion is `PUT /api/users/:id` with `{ role }`.
- **Why not candidate (b)**: extending the Strapi bootstrap to expose a role endpoint adds a Strapi surface and another contract; candidate (a) reuses the already-provisioned admin API token and the two confirmed endpoints, keeping the change inside `apps/api` (the external/audit owner per Q2).
- **Session validation (D2)**: `apps/api` does NOT verify the JWT signature directly (would require the users-permissions `jwtSecret`). Instead it delegates validation to Strapi's own auth by calling `GET /api/users/me` with the caller's access token; a 401 there → 401. This keeps `apps/api` out of credential/signing-handling (Q2/Q3).
- **Audit queries**: `apps/api` calls the public Convex audit queries (`audit:auditListUserConversations`, `audit:auditListMessages`). Note: these are public Convex queries per the approved E3; the admin gate is enforced at the `apps/api` surface (G2). Direct client access to the public audit queries is a known characteristic of the approved design (read-only, no mutations).

## Resume session — 2026-09-09 (D2 finish; F1–F4; G3; J1–J2; K1; L1)

### D2 — done (session-integration surface completed) + necessary `GET /api/me`
- **What**: The session-validation + role-resolution mechanics were already in `apps/api` (`SessionGuard` validates via Strapi `/api/users/me`, resolves role server-side via the admin API; `StrapiService.getMe/getUserRole/listUsers`). Completed D2 by wiring the session-identity surface the dashboard needs to know its own role (F4/G3): added `AuthController` `GET /api/me` (reuses `SessionGuard`, returns `request.user` = `{ id, username, email, role }`), `AuthModule`, and registered it in `AppModule`. This is part of D2's "apps/api validates sessions and enforces role gates" and is required for the dashboard to show/deny the admin audit view by role.
- **Evidence**:
  - `bunx nx run-many -t lint test build typecheck --projects=api` → exit 0 (incl. `auth.controller.spec.ts`).
  - Live check (Strapi + api running): admin login → `/api/me` = `{"id":1,...,"role":"admin"}`; `GET /api/audit/users` → lists the 3 seeded users with roles.
  - Non-admin: `user` login → `/api/me` role=`user`; `GET /api/audit/users` → **403** (S5/G2, no data disclosure).

### F1–F4 — done (dashboard chat + auth wiring)
- **What**: Rebuilt `apps/dashboard` from the Nx welcome page into the real dashboard:
  - `src/lib/auth.ts` — session token helpers (`get/set/clearSessionToken`), `consumeTokenFromLocation` (reads `#token=` from the landing redirect), `fetchSessionUser` (Strapi `/api/users/me`), `redirectTo`. (F4)
  - `src/lib/chat.ts` — pure logic: `MODEL_OPTIONS`/`DEFAULT_MODEL_ID`, `normalizeModelId` (persist modelId), `canSendMessage` (empty send blocked), `deriveDashboardStatus` (empty/unavailable/unauthorized/ready), `PROVIDER_DEFERRED_TEXT`. (F1/F2/F3)
  - `src/lib/api.ts` — apps/api client: `getMe`, `listAuditUsers`, `listUserConversations`, `listConversationMessages`; `ApiResult` discriminated type. (F4/G3)
  - `src/views/chat-view.tsx` — chat pane + conversation viewer/selector + model selector (persists `modelId` via `updateModelId`); sends user message only (`sendMessage`, role `'user'`); renders the provider-deferred placeholder on the assistant slot (AC9); empty conversation list state (S6). Direct Convex via `convex/react` hooks (Q2). (F1/F2)
  - `src/views/audit-view.tsx` — G3 read-only admin audit (users → conversations → messages) consuming `apps/api` audit endpoints; no mutation controls rendered. (G3)
  - `src/app/app.tsx` — auth gate + shell: consumes the token, resolves identity+role, redirects unauthorised users to landing (S4), shows the persistence-unavailable state (F3), routes chat/audit by role.
  - `src/main.tsx` — wires the Convex `ConvexProvider` only when `VITE_CONVEX_URL` is set, else renders the unavailable state; injects env config.
  - Deleted `src/app/nx-welcome.tsx`; CSS in `src/styles.css` + `src/app/app.module.css`.
- **Evidence**: `bunx nx run-many -t lint test build typecheck --projects=dashboard` → exit 0. Unit specs (`chat.spec`, `auth.spec`, `api.spec`, `app.spec.tsx`) all pass.

### G1–G3 — done
- **G1/G2** were already implemented in `apps/api` (audit controller/service + `SessionGuard`/`RolesGuard`/`@Admin()`, `ConvexService` audit queries, `StrapiService` list/role). Verified live (see D2 evidence): admin reads users/conversations/messages; non-admin 403 with no data.
- **G3** (dashboard admin audit UI) implemented in `src/views/audit-view.tsx` per wireframe 3; read-only, no mutation controls (asserted in e2e S3 with `getByRole(button, /delete|edit|remove|moderate/)` count 0).

### J1 — done (Playwright config satisfying the CI `e2e` target)
- **What**: `@nx/playwright/plugin` was already registered (`nx.json` `targetName: e2e`). Added `apps/dashboard/playwright.config.mts` (testDir `./e2e`), which the plugin picks up and attaches an `e2e`/`e2e-ci` target to the `dashboard` project. It configures a `webServer` array to boot Strapi (:1337), apps/api (:3000), dashboard (:4200), landing (:4321) with `reuseExistingServer`; `baseURL=localhost:4200`; sequential (`workers:1`, `fullyParallel:false`, `retries:0`) for deterministic CI. (G6/condition 2)
- **Evidence**: `bunx nx show project dashboard` shows `e2e` target (`playwright test`, cwd `apps/dashboard`). `bunx nx run dashboard:e2e` runs the suite.

### J2 — done (e2e specs S1–S6)
- **What**: Added `apps/dashboard/e2e/` with `auth-helpers.ts` and three spec files covering all six BDD scenarios: `auth.spec.ts` (S1 login, S4 unauth redirect), `chat.spec.ts` (S2 send+persist+placeholder, S6 empty list), `audit.spec.ts` (S3 admin audit read-only, S5 non-admin denial via UI + API 403).
- **Evidence**: `bunx nx run dashboard:e2e` → **6 passed (13.6s)** against the live stack. Re-ran after hardening → 6 passed, no flaky-task warning.

### K1 — done (co-located Vitest specs)
- **What**: Completed the previously-blocked/partial unit tests:
  - `apps/api`: `auth.controller.spec.ts` (me identity), plus already-present `session.guard.spec`, `roles.guard.spec`, `strapi.service.spec`, `audit.service.spec`.
  - `apps/dashboard`: `lib/chat.spec.ts`, `lib/auth.spec.ts`, `lib/api.spec.ts`, `app/app.spec.tsx`.
  - `apps/landing`: fixed the `auth.spec.ts` mock to include `json` (was `TypeError: response.json is not a function`).
  - `lib/contracts`: `contracts.spec.ts` (canonical contract guards) already present.
- **Note on "Convex function contracts"**: the canonical data contract is covered by `contracts.spec.ts`; the Convex queries/mutations themselves are exercised end-to-end by e2e S2/S3 (which call `listOwnConversations`/`createConversation`/`sendMessage`/`updateModelId`/`listMessages` and the audit queries), proving the deployed function contracts. A standalone Vitest harness for Convex functions is not wired up (would need the `convex:test` package); the integration coverage is the L1-proven substitute.
- **Evidence**: `bunx nx run-many -t test --projects=api,dashboard,landing,identity-cms,contracts` → exit 0 (all unit spec files green).

### Necessary fix — landing client script (H1 browser behavior; required for S1/J2)
- **Problem**: `apps/landing/src/pages/index.astro` used `<script lang="ts">` with a top-level `import`. Astro 7.3.1 did NOT bundle it (emitted the raw `<script lang="ts">` as a classic inline script), which caused `[pageerror] Cannot use import statement outside a module` in the browser, so login/register never ran and the auth flow (S1) was broken.
- **Fix**: switched the `<script>` to Astro's processed (non-`lang`) form and made it type-safe: a `must<T>(id)` null-guard helper plus typed element refs / `Mode` / `SubmitEvent`, so Astro bundles it as an inline ESM module **and** `astro check` passes. Kept `import { login, register } from '../lib/auth'`.
- **Evidence**: `bunx astro check` → 0 errors / 0 warnings. `bunx astro build` → `dist/index.html` now contains the bundled `<script type="module">` with the login logic. Browser probe: after filling + submitting the login form, the page navigates to `http://localhost:4200/`.
- **Scope note**: this is an H1 (approved login/register) browser-behaviour fix needed by the e2e; it is an implementation-detail correction, not new scope.

### Env / config updates (AC13 + gate)
- `.env.example`: added `VITE_API_URL=http://localhost:3000` and `VITE_LANDING_URL=http://localhost:4321` to the dashboard section (required by the dashboard's role/audit and S4 redirect).
- `apps/dashboard/.env.local`: added the same two vars (local run; gitignored).
- `.prettierignore`: added `**/convex/_generated` and `**/.strapi-updater.json` (generated/auto-mutated files).
- `README.md`: scoped the Testing commands to the MVP projects (DECISION 1) and documented the e2e service/seed requirement.

### L1 — done (final gate green)
- **Full gate** scoped per DECISION 1: `bunx nx run-many -t lint test build typecheck e2e --projects=api,dashboard,landing,identity-cms,contracts` → **exit 0** ("Successfully ran targets … for 5 projects"; 19 tasks). Re-run after the landing fix + formatting → exit 0.
- **format:check**: `bunx nx format:check --base="remotes/origin/main" --projects=api,dashboard,landing,identity-cms,contracts` → **exit 0** (after formatting MVP sources + prettierignore updates).
- **AC10**: exactly one lockfile (`bun.lock`), no `package-lock.json`; `packageManager: bun@1.3.14` declared.
- **AC11**: module-boundary lint green (`lint` target exit 0); no `@org/*` or `packages/*` imports found in `apps/`/`lib/` MVP code (grep clean); frozen `packages/*` untouched.
- **AC12/seed**: `bun run seed` → exit 0 (Strapi: users exist + admin already `admin`; Convex: "Welcome conversation already exists — skipping"), idempotent against the live deployment.
- **AC13**: `.env.example` enumerates all start/test/seed/operate vars incl. `DATABASE_*`, Convex, app, seed, and the new dashboard vars.
- **Deferred absence (condition 5)**: grep for `agent-router|agent-runtime|session revock|CMS seed|angular retire` in `apps/`/`lib` → clean; no deferred code introduced.

## Current state summary (2026-09-08)

- **Decision 1 implemented & validated**: CI gate scoped to MVP projects (`--projects=api,dashboard,landing,identity-cms,contracts`); packages/* excluded; gate green (run-many + format:check exit 0).
- **Decision 2 RESOLVED (2026-09-08)**: Convex auth + deployment verified in the Apply env. `bunx convex codegen` (repo root) works; all 8 E2/E3 functions deployed to `dev:elegant-leopard-820`; dashboard typecheck passes. F/G/I1-Convex/J/K1/L1 are now unblocked.
- **I1 done (idempotent)**: seed resolves existing users, promotes the admin user (verified in DB: user id 1 → `admin` role), and seeds the Convex welcome conversation once. `bun run seed` exit 0 on repeat runs.
- All non-Convex-dependent Plan tasks implemented/validated: A, B, C, D1 (runtime-validated), E1/E2/E3, I1, I2, I3, K1 (landing auth), dev scripts (user-requested).

## Current state summary (2026-09-09) — PLAN COMPLETE

- **D2, F1–F4, G1–G3, J1–J2, K1, L1 all DONE.** Every pending Plan task is implemented and validated.
- **L1 final gate GREEN**: `bunx nx run-many -t lint test build typecheck e2e --projects=api,dashboard,landing,identity-cms,contracts` → exit 0 (19 tasks); `bunx nx format:check --base="remotes/origin/main" --projects=api,dashboard,landing,identity-cms,contracts` → exit 0; single `bun.lock`; module-boundary lint green; no `@org/*`/`packages/*` imports; seed `bun run seed` → exit 0 (idempotent); README testing walkthrough scoped per DECISION 1; `.env.example` complete (AC13).
- **e2e suite (S1–S6)**: `bunx nx run dashboard:e2e` → 6 passed against the live stack (Strapi + api + dashboard + landing + Convex `dev:elegant-leopard-820`).
- **Necessary landing fix**: `apps/landing/src/pages/index.astro` client script now bundles/executes (Astro was emitting it as a raw classic script); this unblocked S1 login.
- **User-requested dev scripts (same I3 bucket)**: added dependency-free `dev:all` = `bash tools/dev-all.sh` (reuses the four `bun run dev:*` scripts; one process per app; documented env/Convex/seed prerequisites; no combined `dev` flaw). Live-validated all four ports bound in parallel (1337/4321/4200/3000), single dashboard process, no port-4200 conflict.
- Final state is on branch `feat/saas-mvp` with all Plan tasks green; no deferred items (session revocation, Angular retirement, CMS content seed, agent-router/runtime) introduced.
