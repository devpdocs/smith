# Plan Phase

### Purpose

Convert the approved `ai-saas-mvp` specification into an ordered, actionable implementation to-do list with explicit dependencies, validation tasks tied to AC1-AC13, and separated deferred work. Planning introduces no new scope; implementation begins only after the user explicitly approves this Plan at the orchestrator gate (kit-apply sequencing is owned by Kit-Orchestrator).

### Inputs

- Approved specification set (2026-09-07): `ai-saas-mvp.md` (root), `constitution.md` (5 principles, 9 working rules), `specify.md` + sub-phases (17 verified facts, gaps G1-G7), `clarify.md` + sub-phases (confirmed Q1-Q8, canonical data contract, AC1-AC13, S1-S6, wireframes), `approval.md` (verdict APPROVED + 5 Plan conditions).
- Calibrated context `spec-kit.mini/config.yaml`; read-only verification 2026-09-07: Nx 23.2.0, `bun.lock` only (no `package-lock.json`), CI runs `npm ci`, no `lib/`, no Playwright config/specs, `@nx/node` devDependency present but unregistered.
- Approval → Plan transition explicitly approved by the user and recorded in the root spec (2026-09-07).

### Sequencing (dependency order)

| # | Group | Purpose | Depends on |
| :-- | :--- | :--- | :--- |
| 1 | A. Package-manager governance | bun canonical end to end (AC10) | — |
| 2 | B. Nx integrations | only required registrations, verified for Nx 23.2.0 (WR2) | A |
| 3 | C. Scaffolding + `lib/` | apps/api, apps/dashboard, apps/landing, shared code (AC11) | B |
| 4 | D. Strapi completion | roles `user`/`admin`; session surface (Q3) | A (parallel with B-C) |
| 5 | E. Convex backend | schema + queries/mutations (Q1/Q2; AC2) | B |
| 6 | F. Dashboard | chat, selectors, states (AC1/AC5/AC8/AC9) | C, D, E |
| 7 | G. Admin audit | apps/api endpoints + dashboard UI (AC3/AC6/AC7) | C, D, E |
| 8 | H. Landing | login/register + presentation (AC4) | C, D |
| 9 | I. Deliverables | seed, `.env.example`, README (AC12/AC13) | C, D, E |
| 10 | J. E2E | Playwright config + S1-S6 specs (G6) | F, G, H, I1 |
| 11 | K. Unit tests | co-located Vitest specs (WR7) | continuous with 3-9 |
| 12 | L. Final validation | full CI gate green (WR8; AC10) | A-K |

Hard rules: governance before scaffolding; scaffolding before features; features before e2e; deliverables validated in L before the Plan is complete (WR6). Group A ships and validates as ONE canonical-manager change before any scaffolding merges (approval condition 3). The `nx.json` `release.projects` fix is explicit scaffolding work (C2), never silent (A8).

### Outputs (document set)

- This document: phase record, sequencing, approval criteria.
- `plan-tasks.md`: ordered to-do list (29 tasks) with approved-source citations and dependencies.
- `plan-validation.md`: AC1-AC13 → task mapping, BDD S1-S6 coverage, final gate checklist.
- `plan-risks-deferred.md`: risks, execution assumptions, deferred follow-ups, Plan-condition traceability.

### Approval Criteria

- Approved scope fully represented as a to-do list; tasks executable without reinterpreting the specification.
- Dependencies and sequencing explicit; validation explicit and tied to ACs; deferred work separated from required work.
- No new scope introduced; no deferred item appears as an implementation task; every AC validated by at least one task.
- Explicit user approval of this Plan at the orchestrator gate before kit-apply begins.

### Working Rules

- Every task cites approved sources (Q1-Q8, AC1-AC13, S1-S6, G-gaps, WR1-9, baseline facts, approval conditions).
- If execution reveals a true specification gap, stop and return it via Kit-Orchestrator to clarify/specify; never resolve gaps in flight.
- This phase writes only `plan*.md` artifacts; the root spec and all prior phase documents remain untouched.

### Validation Status (pre-return self-check)

- Capacity: this file is within 100 lines; each sub-document is within 60 lines (verified with line counts).
- AC1-AC13 all mapped to tasks (`plan-validation.md`); all 5 Plan conditions addressed (`plan-risks-deferred.md`).
- Specification gap scan: NONE — every approved scope item maps to a task; no gap return required.

### Notes

- Approval of this Plan is handled by Kit-Orchestrator; this phase produces no approval record.
- Artifact language: professional English; user conversation remains Spanish (root Notes).
- kit-apply owns `apply-progress.md`; this Plan authorizes no implementation.
