# Specify Phase

### Purpose

Capture the approved feature intent, the verified current implementation baseline, the package-manager evidence record, explicit assumptions, known data-contract gaps, and unresolved questions for `ai-saas-mvp`. This draft gives the Clarify phase a grounded, challengeable baseline so open items can be resolved without re-discovering repository state.

### Inputs

- Approved `constitution.md` (2026-09-07): five governing principles, technical-stack context, Working Rules 1-9.
- Root specification `ai-saas-mvp.md`: Feature Context and Open Items 1-7 (read-only for this phase).
- Calibrated repository context `spec-kit.mini/config.yaml` (schema 1.0, confidence 0.79) — used as the default repository baseline before inferring additional assumptions.
- Read-only repository verification performed on 2026-09-07, branch `feat/saas-mvp`; evidence recorded in `specify-baseline.md`.

### Activities

- Restated the approved MVP scope from the root Feature Context without adding scope.
- Verified preflight baseline facts against the repository (read-only) and recorded them as facts.
- Gathered package-manager evidence per Constitution Working Rule 1 and recorded it without deciding silently.
- Separated facts from assumptions; listed every assumption explicitly for challenge.
- Carried Open Items 1, 2, 4, 5, and 6 forward verbatim as unresolved questions; recorded new gaps found during verification.

### Feature Intent (Approved MVP Scope)

End-to-end functional AI SaaS MVP inside the existing `smith` Nx monorepo. User priorities: end-to-end function first; simple, readable code over optimization; established technologies and standards only (Constitution Principles 1-3).

Core behavior (declared by the user):
- Chat with per-user history; every generation is persisted in the user's history.
- Authentication with hashed passwords.
- Roles `user` and `admin`; the admin audits other users' sessions.

Target architecture (declared by the user):
- `apps/api` (Node + NestJS), `apps/dashboard` (React + Vite), `apps/landing` (Astro); new shared code in `lib/`.
- Storage: "SQLite with Convex" — interpretation unresolved (Open Item 1).

Modules: Strapi CMS (existing `apps/identity-cms`; user and web-content management), Convex (conversation and session-history management), Landing (login/register + SaaS presentation), Dashboard (main chat + chat viewer/selector + model selector).

Mandatory deliverables: complete `.env.example`, reproducible seed with test data, README with startup instructions.

Deferred (hard boundary, Constitution Principle 4): `agent-router` (model provider) and `agent-runtime` (orchestration). Neither is a prerequisite of the MVP; the model-selector behavior under this deferral is Open Item 6.

### Outputs

- This document: feature intent and phase record.
- `specify-baseline.md`: verified implementation baseline (facts, evidence, and known data-contract gaps).
- `specify-assumptions-and-open-questions.md`: package-manager record, explicit assumptions, and unresolved questions carried to Clarify.

### Approval Criteria

- Feature intent is restated without introducing new scope or resolving open items.
- Baseline facts are verified, evidenced, and separated from assumptions.
- Package-manager evidence is recorded with no silent decision (Constitution Working Rule 1).
- Open Items 1, 2, 4, 5, and 6 are carried forward verbatim and unresolved.
- Every assumption is listed explicitly and is challengeable.
- The draft is reviewed and accepted at the Specify approval gate.

### Working Rules

- No planning-level technical decisions in this phase; ambiguity is not resolved here.
- Facts and assumptions are recorded separately; open questions are not treated as decisions.
- Deferred capabilities stay deferred; no artifact may make `agent-router` or `agent-runtime` an MVP prerequisite.
- Constitution Working Rules 2-9 govern downstream work; Working Rule 9 scope discipline applies to this draft.
- Artifact language: professional English; neutral, reviewable wording.

### Notes

- The package-manager record outcome is an unresolved question with competing repository/CI evidence; it must be settled before Plan (Constitution Working Rule 1).
- The reference file `specify-phase-process.md` does not currently contain the flagged term "appreciation of development"; the term was not used in these artifacts and is reported to the orchestrator for user confirmation.
- This draft is the historical Specify baseline; later phases record their own decisions in their own documents.
- The Constitution → Specify transition was explicitly approved by the user on 2026-09-07 and is recorded in the root specification's Approval History.
