# Constitution Phase

### Purpose

Establish the binding principles and decision rules for the AI SaaS MVP specification. Later phases must use this document as their governance baseline and must not introduce scope that conflicts with it.

### Inputs

- User-approved feature context and priorities in `ai-saas-mvp.md`.
- Calibrated repository context in `spec-kit.mini/config.yaml` (schema 1.0, confidence 0.79).
- Existing Nx, CI, package, testing, and module-boundary conventions recorded during preflight.

### Activities

- Define principles for scope, quality, technology, and deferred capabilities.
- Establish the target stack context without treating planned components as existing capabilities.
- Define enforceable rules for package management, Nx integration, shared code, documentation, data setup, and validation.
- Preserve unresolved feature-level questions for Specify and Clarify.

### Outputs

- A governing constitution for Specify, Clarify, Approval, and Plan.
- Explicit technical assumptions and repository risks for later review.
- A decision order for resolving conflicts between requirements, governance, conventions, and assumptions.

### Governing Principles

1. **End-to-end functionality first.** The MVP must deliver a coherent, usable flow across its declared boundaries before optional breadth, optimization, or polish is considered.
2. **Simplicity and readability over optimization.** Prefer the smallest clear design that satisfies approved requirements. Do not introduce performance mechanisms without an evidenced need.
3. **Established technologies and standards only.** Use mature, documented technologies and repository-compatible standards. New tools require an explicit rationale, compatibility evidence, and approval in a later phase.
4. **Deferred orchestration is a hard boundary.** `agent-router` and `agent-runtime` are out of scope for v1. Later artifacts must not make either a prerequisite for the MVP or silently replace the deferral with speculative behavior.
5. **Traceable persistence and documentation.** Approved behavior that generates user-visible or session-relevant data must define its persistence expectations; the required environment template, seed data, and startup documentation are part of MVP completeness.

### Technical-Stack Context

- The target architecture is `apps/api` with Node and NestJS, `apps/dashboard` with React and Vite, and `apps/landing` with Astro.
- New shared code is governed under `lib/`; the existing `packages/*` tree contains tagged Nx packages and an unwired Angular shop experiment.
- Strapi 5.52.3 with `better-sqlite3` and `users-permissions` exists at `apps/identity-cms` and is the declared CMS context.
- Convex is the declared context for conversations and session history. The phrase “SQLite with Convex” and service responsibilities remain unresolved feature questions.
- The repository is an Nx TypeScript monorepo with Node and Bun signals, ESLint module-boundary enforcement, Prettier, and EditorConfig.
- Required Nx integrations for NestJS, React-Vite, Astro, Convex, and Node are not all registered. Their addition is governed below; their absence is not evidence that the target applications already exist.
- Vitest uses co-located `*.spec.ts` files in `packages/*/src`. CI has configured targets, including e2e, but no Playwright configuration or e2e specifications were detected during preflight.

### Working Rules

1. **Package-manager reconciliation.** The repository currently has a `bun.lock`, CI runs `npm ci`, and the root package does not declare `packageManager`. Specify must record one canonical package manager using repository and CI evidence before Plan. CI, lockfiles, scripts, and documentation must then be reconciled to that choice; dual-manager support is not an implicit solution.
2. **Nx plugin additions.** Add only the missing Nx/plugin registrations required by the approved target projects or validation targets: NestJS, React-Vite, Astro, Convex, and Node as applicable. Verify compatibility with the installed Nx version, avoid unrelated plugin adoption, and keep project discovery and target ownership explicit.
3. **Shared-code boundaries.** New cross-application code belongs in `lib/` and must have a clear responsibility and dependency direction. Nx scope/type tags and `@nx/enforce-module-boundaries` remain binding; shared code must not depend on application-specific code.
4. **Angular experiment isolation.** The unwired `packages/*` Angular shop experiment is not a dependency of the MVP. Do not expand or repair it incidentally. Its retirement, migration, or continued isolation must be handled as an explicit later decision; until then, new MVP code must not import its unresolved `@org/*` paths.
5. **Environment completeness.** `.env.example` must enumerate every variable required to start, test, seed, or operate the MVP, with safe non-secret placeholders and no committed secret values. The existing incomplete CMS example is not sufficient by itself.
6. **Seed and startup documentation.** A reproducible seed with test data and a README with startup instructions are mandatory deliverables. They must cover the approved local development path and be validated before Plan is considered complete.
7. **Testing convention.** New unit tests follow the established Vitest convention: co-located `*.spec.ts` files near the tested code. No separate test directory is required unless a later phase justifies it.
8. **CI target gate.** New work must leave the configured CI targets passing: lint, test, build, typecheck, e2e, and `format:check`. Missing e2e configuration or coverage commands are repository risks to be made explicit, not reasons to bypass the gate.
9. **Scope discipline.** Constitution rules govern how later phases decide; they do not decide feature semantics. Open Items 1, 2, 4, 5, and 6 remain unresolved and must be carried into Specify/Clarify.

### Approval Criteria

- Principles are clear, enforceable, and applicable to later decisions.
- Technical context distinguishes declared targets from repository facts and gaps.
- Decision rules cover package management, Nx integration, boundaries, documentation, seed data, testing, and CI validation.
- No feature-level open item is resolved by this document.
- The document remains within the phase capacity limit and is explicitly approved before Specify begins.

### Notes

- Conflict resolution order is: **user requirements > this Constitution > existing repository conventions > assumptions**.
- A conflict must be recorded with its evidence and escalated to the phase approval gate when the higher-order source is ambiguous.
- The Constitution does not modify the root specification, its open items, or its approval history.
