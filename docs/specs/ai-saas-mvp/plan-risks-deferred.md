# Plan: Risks, Assumptions, Deferred Work, Plan Conditions

## Parent Phase

Plan — main document `plan.md`.

## Risks / Blockers

- R1. Astro and Convex may lack Nx plugins compatible with the installed Nx 23.2.0; B1's fallback is explicit `project.json` target wiring per the identity-cms precedent. Not a spec gap: WR2 authorizes either plugin registration or explicit target wiring; Principle 3 requires compatibility evidence either way.
- R2. Convex is a hosted external dependency (condition 4): local development needs the Convex dev CLI and a provisioned deployment; E1 documents env vars and the explicit unavailable-persistence fallback; chat data is written nowhere else (AC2).
- R3. CI must orchestrate services for e2e (Strapi, Convex, apps) or run e2e against dev servers seeded via I1; the orchestration detail belongs to J1-J2 within G6/condition 2 scope. Nx Cloud distribution steps (R5) may need adjustment; any CI change stays under the one-change discipline of Group A.
- R4. users-permissions distinguishes Strapi Panel super-admins from end-user roles; D1 must configure `user`/`admin` as end-user roles only (Q3) so the audit role gate stays meaningful (AC6/AC7).
- R5. Nx Cloud CI steps use `npx`; A2 must keep them functional under bun (bunx/npx both resolve node_modules); verify before scaffolding merges (condition 3).
- R6. Bun-migration rollback awareness (condition 3): A1+A2 land as one reviewable change; a single revert restores the prior documented state; no `package-lock.json` exists today, so no dual-lockfile state can occur.

## Execution Assumptions (carried unchanged from Clarify)

- A5/A6 stand: Vitest co-located convention (WR7) and the full CI gate (WR8) bind all new apps.
- A7/A9 stand: local run without Docker; Node 24 runtime; toolchain via bun (Q6).
- Wireframes in `clarify-assumptions.md` define structure, not style, for landing, dashboard, and audit screens.

## Deferred Follow-ups (explicitly NOT v1 scope — no task implements these)

1. Session revocation — deferred by Q4 decision; not an apps/api or Convex task.
2. Angular `packages/*` retirement/migration — deferred by Q7 with its explicit cost; frozen and isolated per WR4/AC11.
3. CMS web-content seeding — deferred by Q8 (Landing v1 uses static presentation only).
4. `agent-router` (model provider) and `agent-runtime` (orchestration) — Constitution Principle 4 hard boundary; Q5 keeps the provider-deferred placeholder instead of any simulated behavior.

These four items must not appear as implementation tasks, e2e scenarios, or seed content; the L1 checklist confirms their absence (condition 5).

## Plan-Condition Traceability (approval.md Review Findings section 5)

| Condition | Where addressed |
| :--- | :--- |
| 1. Deliverables complete (seed, README, `.env.example` incl. G3) | I1-I3; I2 fixes G3/AC13; validated in L1 (WR6) |
| 2. Playwright config + e2e specs for the CI gate (G6) | J1-J2; validated in L1 |
| 3. npm→bun CI migration as ONE canonical-manager change with rollback awareness | A1-A3 sequenced first and gated before scaffolding; rollback in A2/R6; validated in L1 |
| 4. Convex hosted external-dependency handling | E1 (docs + fallback), I2/I3 (env + README), R2 |
| 5. Deferred items must not re-enter v1 | Deferred section above; L1 checklist confirms absence |

## Links

- Parent: `plan.md`; tasks: `plan-tasks.md`; validation: `plan-validation.md`.
