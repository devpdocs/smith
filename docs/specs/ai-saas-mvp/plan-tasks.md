# Plan: Ordered Implementation Task List

Parent: `plan.md`. Format: `- [ ] <ID>. task (approved sources) — depends: X`. Dependencies are hard unless noted; deferred items are excluded by design (see `plan-risks-deferred.md`).

### A. Package-manager governance — FIRST (Q6/AC10; WR1; condition 3)
- [ ] A1. Declare `packageManager` (bun, pinned version) in root `package.json` (Q6; AC10).
- [ ] A2. Migrate CI npm→bun as ONE atomic canonical-manager change: bun setup + `bun install --frozen-lockfile` + bun cache in `.github/workflows/ci.yml`; keep Nx Cloud and Playwright steps functional; validate frozen-lockfile install locally; document single-commit rollback (revert restores prior state; no `package-lock.json` exists today, so no dual-lockfile state) (Q6; AC10; condition 3). Gate: CI green on bun before any Group C merge.
- [ ] A3. Verify all local targets, scripts, and docs invoke bun; no npm/dual-manager residue (Q6; AC10; WR1).

### B. Nx integrations — only what approved targets need (WR2)
- [ ] B1. Verify compatibility with installed Nx 23.2.0 and register only missing integrations required by approved targets: `@nx/nest` + `@nx/react` dependencies, `@nx/node` plugin registration (devDependency exists, unregistered — baseline fact 10), Astro and Convex integrations; for any target lacking a compatible plugin, wire explicit `project.json` targets following the identity-cms `nx:run-commands` precedent (WR2; Principle 3). No unrelated plugin adoption (WR2; verified in L1).

### C. Scaffolding + shared code (root architecture; Q7/AC11)
- [ ] C1. Scaffold `apps/api` (NestJS) with lint/test/build/typecheck targets and Vitest co-located specs (WR7) — depends: B1.
- [ ] C2. Explicitly correct dangling `nx.json` `release.projects: ["api"]` to the real scaffolded project name, documented in the change description, never silent (A8; baseline fact 14) — depends: C1.
- [ ] C3. Scaffold `apps/dashboard` (React + Vite) with targets and Vitest (root architecture; WR7) — depends: B1.
- [ ] C4. Scaffold `apps/landing` (Astro) per B1 outcome (root architecture) — depends: B1.
- [ ] C5. Create `lib/` shared-code home with Nx scope/type tags; extend `@nx/enforce-module-boundaries` depConstraints for the new MVP scopes; shared code never depends on app code; forbid `@org/*` and `packages/*` imports in MVP code (Q7; AC11; WR3-4; baseline facts 13, 17) — depends: B1 (parallel with C1-C4).

### D. Strapi completion — existing `apps/identity-cms` (Q3; Q2/Q3)
- [ ] D1. Configure end-user roles `user`/`admin` in users-permissions; registration defaults to `user`; admin role assigned only via the seed (Q3; AC4-AC7) — depends: A3.
- [ ] D2. Session-integration surface: confirm/configure the plugin-managed refresh + httpOnly session with role claims; `apps/api` validates sessions and enforces role gates without handling credentials (Q2/Q3; AC4) — depends: D1, C1.

### E. Convex backend (Q1/Q2; canonical data contract)
- [ ] E1. Convex integration setup; document hosted-service dependency, required env vars, dev CLI workflow, and the explicit unavailable-persistence fallback behavior (Q1; condition 4; fallback rules) — depends: B1.
- [ ] E2. Convex schema per canonical contract: Conversation (id, ownerUserId, title, modelId|null, createdAt, updatedAt); Message (id, conversationId, role, content, createdAt); user messages only in v1 (contract; Q5/AC9; AC2) — depends: E1.
- [ ] E3. Queries/mutations: dashboard direct-client flow with strict per-user scoping (create conversation, list own conversations, read messages, send user message, update modelId) plus the read-only audit path for `apps/api` (list any user's conversations with metadata, read messages) (Q1/Q2; AC1/AC3/AC5/AC6) — depends: E2.

### F. Dashboard features (Q5; AC1/AC5/AC8/AC9; S2/S4/S6)
- [ ] F1. Chat view + conversation viewer/selector + model selector persisting modelId with the conversation; per-user conversation scoping (Q5; AC1/AC5/AC8; wireframe 2) — depends: C3, C5, D2, E3.
- [ ] F2. Provider-deferred placeholder on send; persist the user message only; no simulated or canned assistant content (Q5/AC9; rendering rules) — depends: F1.
- [ ] F3. Empty/invalid/fallback states: empty conversation list invites the first chat; unauthenticated → login redirect; empty message send blocked with nothing persisted; unavailable persistence → explicit unavailable state (S4/S6; contract states) — depends: F1.
- [ ] F4. Dashboard auth wiring consuming the Strapi session established at landing (Q3; AC4/AC5; S1) — depends: D2, C3.

### G. Admin audit — apps/api + dashboard UI (Q4; AC3/AC6/AC7; S3/S5)
- [ ] G1. Role-gated read-only audit endpoints in `apps/api`: list users (users-permissions), list any user's conversations with metadata, read messages; filter by user only; no mutation operations (Q4/AC6; Q2/AC3) — depends: D2, E3.
- [ ] G2. Non-admin audit denial without data disclosure, enforced at the API surface (Q4/AC7; S5) — depends: G1.
- [ ] G3. Dashboard admin audit UI (read-only): users → conversations → messages per wireframe 3; consumes apps/api audit endpoints; no mutation controls rendered (Q4/AC6; wireframe 3; rendering rules) — depends: G1, C3.

### H. Landing (S1/AC4)
- [ ] H1. Login/register two-mode panel + SaaS presentation wired to Strapi auth; generic errors without user enumeration (S1/AC4; wireframe 1; invalid-state rules) — depends: C4, D1.

### I. Deliverables (WR5-6; condition 1; AC12/AC13)
- [ ] I1. One reproducible seed command covering both stores: Strapi (1 admin + >=2 users, safe placeholder credentials) + Convex (>=1 conversation with several messages) (Q8/AC12; G4) — depends: D1, E3.
- [ ] I2. Complete `.env.example` enumerating every variable required to start, test, seed, or operate the MVP — all Strapi vars incl. `DATABASE_*` (fixes G3), Convex vars, app, seed, and runtime variables; safe non-secret placeholders; no committed secrets (G3/AC13; WR5; condition 1) — depends: D1, E1.
- [ ] I3. README startup instructions: prerequisites, bun, env setup, seed command, running each app, Convex hosted-service note (AC12/AC13; WR6; conditions 1+4) — depends: I1, I2.

### J. E2E — Playwright (G6; condition 2; WR8)
- [ ] J1. Playwright workspace configuration satisfying the existing CI `e2e` target (G6; baseline fact 16; condition 2) — depends: C1-C4.
- [ ] J2. Playwright e2e specs covering S1-S6: S1 register/login; S2 send + persistence + placeholder; S3 admin audit read-only; S4 unauthenticated redirect; S5 non-admin denial; S6 empty conversation list (G6; AC1-AC9; S1-S6; condition 2) — depends: J1, F1-F3, G1-G3, H1, I1.

### K. Unit tests (WR7)
- [ ] K1. Co-located Vitest `*.spec.ts` for all new units (session validation, role gates, Convex function contracts, lib shared code, dashboard state logic) (WR7; assumption A5) — continuous with C-G tasks; proven in L1.

### L. Final validation (WR8/AC10; WR6)
- [ ] L1. Full gate green via bun/Nx: lint, test, build, typecheck, e2e, `format:check`; single `bun.lock` confirmed; module-boundary lint confirms AC11; seed and README walkthrough validated from clean state (WR8; AC10-AC13; WR6; all conditions) — depends: A-K.

## Links

- Parent: `plan.md`; AC mapping: `plan-validation.md`; risks/deferred: `plan-risks-deferred.md`.
