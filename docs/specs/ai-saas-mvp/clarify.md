# Clarify Phase

### Purpose

Resolve the ambiguity left by Specify for `ai-saas-mvp` and record explicit, user-confirmed decisions that Approval and Plan can rely on. PASS 1 produced proposals; the user reviewed every one and confirmed Q1-Q8 (one adjustment at Q2) on 2026-09-07. This document records the confirmed decision register; the three sub-documents carry the canonical data contract, acceptance criteria with BDD scenarios, and ASCII wireframes with the assumption-disposition record.

### Inputs

- Approved `constitution.md` (2026-09-07): five governing principles, nine working rules; conflict order user requirements > constitution > conventions > assumptions.
- Approved Specify output: `specify.md`, `specify-baseline.md` (17 verified facts), `specify-assumptions-and-open-questions.md` (A1-A10, Q1-Q8, package-manager record).
- Root specification `ai-saas-mvp.md` (Feature Context, Open Items 1-7); calibrated context `spec-kit.mini/config.yaml` (confidence 0.79).
- PASS 1 proposal documents of this phase, including fresh read-only verification of lockfiles, CI, and the root `package.json`.
- User confirmation of every proposal on 2026-09-07, relayed decision-by-decision by Kit-Orchestrator (user = decision authority).

### Activities

- Listed and challenged assumptions A1-A10; each is now replaced or grounded by a confirmed decision (record in `clarify-assumptions.md`).
- Resolved Q1-Q8 in sequence Q1→Q2→Q3→Q4→Q5→Q8→Q7→Q6 as proposals; recorded user confirmations, including the Q2 adjustment ("Direct + external api").
- Derived the canonical data contract and closed gaps G1-G7 where the decisions determine them.
- Defined rendering rules and empty/invalid/fallback states; produced testable acceptance criteria, BDD scenarios, and low-fidelity ASCII wireframes.

### Confirmed Decision Register (decision authority: user — all confirmed 2026-09-07)

| ID | Decision (confirmed 2026-09-07) | Detail document |
| :--- | :--- | :--- |
| Q1 | Split stores: Strapi (better-sqlite3, existing `apps/identity-cms`) owns identity + web content; Convex (its own hosted backend/storage) is the system of record for conversations and session history; nothing writes SQLite directly for chat data. | `clarify-proposals-core.md` |
| Q2 | Direct + external api: the dashboard talks directly to Convex for the chat experience; `apps/api` is the only externally exposed surface (Strapi session integration, role-gated audit API, external conversation access); dashboard chat messages never pass through NestJS. | `clarify-proposals-core.md` |
| Q3 | users-permissions is the single auth source (hashing, jwt refresh, httpOnly sessions); `user`/`admin` are end-user roles, not Strapi Panel super-admins; api validates sessions and enforces role gates without handling credentials. | `clarify-proposals-core.md` |
| Q4 | Admin audit v1 is read-only over Convex conversations: list users, list conversations per user with metadata, read messages; filter by user only; no moderation/delete/export; session revocation deferred. | `clarify-proposals-core.md` |
| Q5 | Model selector is present and persists the chosen model identifier with the conversation; zero inference in v1; explicit "provider deferred" placeholder on send; no canned or simulated responses. | `clarify-proposals-scope.md` |
| Q6 | bun is the canonical package manager (Working Rule 1 satisfied before Plan): `packageManager` declared in root, CI migrated to bun with frozen lockfile + bun cache, single `bun.lock`; dual-manager excluded. | `clarify-proposals-scope.md` |
| Q7 | All new shared code in `lib/` with Nx scope/type tags and module-boundary enforcement; `packages/*` Angular experiment frozen and isolated (no `@org/*` imports, no incidental repair); retirement is an explicit future decision with cost. | `clarify-proposals-scope.md` |
| Q8 | One reproducible seed command covers both stores: 1 admin + >=2 regular users in Strapi (safe placeholder credentials), >=1 conversation with several messages in Convex; CMS web content not seeded in v1 unless Landing requires it. | `clarify-proposals-scope.md` |

### Outputs

- This document: confirmed decision register and phase record.
- `clarify-proposals-core.md`: canonical data contract, gap-closure map G1-G7, rendering rules, empty/invalid/fallback states.
- `clarify-proposals-scope.md`: testable acceptance criteria (AC1-AC13) and BDD scenarios (S1-S6).
- `clarify-assumptions.md`: low-fidelity ASCII wireframes and the A1-A10 disposition record.

### Approval Criteria

- Every assumption replaced or grounded by a confirmed decision; every open question answered; no item treated as resolved without user confirmation.
- Data contract, rendering rules, and fallback states are explicit; acceptance criteria are testable and consistent with the BDD scenarios.
- No criterion or scenario makes `agent-router`/`agent-runtime` a prerequisite (Principle 4); no scope beyond the confirmed decisions.

### Working Rules

- Product behavior is recorded separately from implementation detail.
- Unresolved items must be carried forward explicitly; none remain for Q1-Q8.
- Deferred-by-decision items (see Notes) must not re-enter scope silently.
- Artifact language: professional English; neutral, reviewable wording.

### Notes

- Deferred by decision (not unresolved): session revocation (Q4), Angular experiment retirement with its cost (Q7), CMS web-content seeding unless Landing requires it (Q8).
- Deferred by Constitution: `agent-router` and `agent-runtime` remain out of scope for v1 (Principle 4).
- The root specification's Clarify status and Approval History are updated at the approval gate by Kit-Orchestrator; this phase does not edit the root file.
