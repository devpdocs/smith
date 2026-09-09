# Plan: AC Validation Mapping and Final Gate

## Parent Phase

Plan — main document `plan.md`.

## Purpose

Map every acceptance criterion AC1-AC13 to the plan tasks that implement and validate it, show BDD S1-S6 e2e coverage, and define the final validation checklist (Working Rules 6 and 8).

## AC → Task Mapping

| AC | Source | Implemented by | Validated by |
| :-- | :--- | :--- | :--- |
| AC1 | Q1/Q2 | F1, E3 | J2 (S2), K1 persistence specs |
| AC2 | Q1 | E2 (Convex-only chat storage) | L1 review: no SQLite chat writes anywhere; K1 |
| AC3 | Q2 | F1 (direct Convex), G1 (audit via apps/api) | J2 (S3, S5) |
| AC4 | Q3 | D1, D2, H1, F4 | J2 (S1), K1 session specs |
| AC5 | Q3/Q5 | E3 scoping, F1 | J2 (per-user history in S2/S6), K1 scoping specs |
| AC6 | Q4 | G1, G3 | J2 (S3), K1 audit specs |
| AC7 | Q4 | G2 | J2 (S5), K1 denial specs |
| AC8 | Q5 | F1 (modelId persisted with conversation) | J2 (S2 model selection), K1 |
| AC9 | Q5 | F2 (placeholder; user messages only) | J2 (S2), K1 no-simulated-content specs |
| AC10 | Q6 | A1-A3 | L1 (single `bun.lock`, CI green), A2 local frozen-install check |
| AC11 | Q7 | C5 | L1 boundary lint pass; K1 (no `@org/*`/`packages/*` imports) |
| AC12 | Q8 | I1, I3 | L1 seed run from clean state; J2 uses seeded data |
| AC13 | WR5/G3 | I2 | L1 env-template completeness check incl. `DATABASE_*` |

Every AC has at least one implementing task and at least one validating task or step.

## BDD Scenario Coverage (G6; condition 2)

- S1 → J2 spec; S2 → J2 spec; S3 → J2 spec; S4 → J2 spec (F3 behavior); S5 → J2 spec (G2 behavior); S6 → J2 spec (F3 behavior).
- Each Playwright spec file cites its S-id and its source ACs; all six scenarios run under the CI `e2e` target (J1).

## Final Gate Checklist (WR8; WR6; AC10)

- [ ] lint, test, build, typecheck, e2e, `format:check` all green via bun + Nx.
- [ ] Exactly one lockfile (`bun.lock`); no `package-lock.json`; `packageManager` declared (AC10).
- [ ] Seed command runs from a clean state and covers both stores per Q8 (AC12).
- [ ] README startup walkthrough succeeds on a fresh checkout (AC12; WR6).
- [ ] `.env.example` enumerates every start/test/seed/operate variable, including `DATABASE_*` (AC13).
- [ ] Module-boundary lint passes; no `@org/*` or `packages/*` imports in MVP code (AC11).
- [ ] Deferred items absent from the tree: no session revocation, no Angular `packages/*` retirement work, no CMS content seeding, no `agent-router`/`agent-runtime` code (condition 5).

## Links

- Parent: `plan.md`; tasks: `plan-tasks.md`; risks/deferred: `plan-risks-deferred.md`.
