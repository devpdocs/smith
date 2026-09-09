# Specify: Package-Manager Record, Assumptions, and Open Questions

## Parent Phase

Specify — main document `specify.md`; verified facts in `specify-baseline.md`.

## Purpose

Record the Constitution Working Rule 1 package-manager evidence, the explicit assumption list, the known data-contract gaps, and the unresolved questions carried to Clarify. Nothing here is a decision.

## Details

### Package-manager record (Constitution Working Rule 1)

| Evidence | Source | Direction |
| :--- | :--- | :--- |
| `bun.lock` present; no `package-lock.json` exists | repository | bun |
| identity-cms targets invoke `bun run` (develop/build/start) | repository | bun |
| bun detected as runtime/package manager (calibration, confidence 0.85-0.90) | calibration | bun |
| CI uses `npm ci` + `cache: 'npm'` on Node 24 | CI | npm |
| Root `package.json` declares no `packageManager` field | repository | neutral |
| `npm ci` without a committed `package-lock.json` is a CI integrity risk | CI gap | — |

Outcome: UNRESOLVED — carried to Clarify (root Open Item 7). Repository evidence leans toward bun; CI evidence leans toward npm. Reconciliation is mandatory either way: choosing bun implies moving CI install/cache steps, scripts, and docs to bun; choosing npm implies generating and committing a `package-lock.json` and rewiring the `bun run` targets. Dual-manager support is excluded by Working Rule 1. The choice must be settled before Plan.

### Assumptions (explicit, challengeable — not facts)

- A1. users-permissions can serve as the auth source with built-in password hashing and refresh-token sessions; contingent on Open Item 4.
- A2. Identity data (Strapi/SQLite) and conversation data (Convex) can coexist as separate stores; contingent on Open Item 1.
- A3. The Angular shop experiment stays frozen and isolated; the MVP neither depends on it nor repairs it; its fate is a later explicit decision (Working Rule 4).
- A4. `lib/` will be created as the new shared-code home under Nx module-boundary rules; the layout question is Open Item 3.
- A5. The Vitest co-located `*.spec.ts` convention extends to all new apps (Working Rule 7).
- A6. New apps must satisfy the full CI gate as they land, including e2e coverage that does not exist yet (Working Rule 8).
- A7. The MVP runs locally without Docker despite `@nx/docker` targets; no Dockerfile or compose file exists.
- A8. `release.projects: ["api"]` intends the future `apps/api` project; the intent is not evidenced in-repo today.
- A9. Node 24 (CI) is the intended runtime for new apps; identity-cms keeps its `bun run` wiring.
- A10. The model selector has some minimal v1 behavior while `agent-router`/`agent-runtime` are deferred; assuming it is UI-only would be premature (Open Item 6).

### Unresolved questions carried to Clarify (verbatim intent)

- Q1 (Open Item 1): Meaning of "SQLite with Convex" (Convex normally ships its own backend/storage).
- Q2 (Open Item 2): Responsibility boundary between `apps/api` (NestJS) and Convex.
- Q3 (Open Item 4): Auth ownership: Strapi users-permissions (already hashes passwords) vs custom auth in `apps/api`; where the `admin` role lives.
- Q4 (Open Item 5): Scope of the admin "session audit".
- Q5 (Open Item 6): Model-selector behavior while `agent-router`/`agent-runtime` are deferred.
- Q6 (Open Item 7): Package-manager reconciliation: bun lockfiles vs npm-based CI (evidence recorded above; unresolved here).
- Q7 (Open Item 3): `lib/` vs existing `packages/*` layout; fate of the prior Angular shop experiment (later explicit decision per Working Rule 4).
- Q8 (new): Seed scope: which stores and datasets the seed covers (Strapi users/content, Convex conversations, audit fixtures).

## Decisions Or Evidence

No decisions are made in Specify. The evidence above is recorded only; Clarify resolves, challenges, or defers each item.

## Links

- Parent: `specify.md`; facts: `specify-baseline.md`; governance: `constitution.md`.
