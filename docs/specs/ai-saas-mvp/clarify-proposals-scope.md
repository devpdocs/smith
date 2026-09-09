# Clarify: Acceptance Criteria and BDD Scenarios

## Parent Phase

Clarify — main document `clarify.md` (confirmed decision register, 2026-09-07).

## Purpose

Provide testable acceptance criteria per confirmed decision and minimal BDD scenarios covering primary behavior plus empty/invalid/fallback states.

## Details

### Acceptance criteria (testable)

- AC1 (Q1/Q2): a message sent in the dashboard is persisted in Convex as part of that user's conversation and is retrievable after reload.
- AC2 (Q1): no MVP code writes SQLite directly for chat data; conversations and messages live only in Convex.
- AC3 (Q2): dashboard chat traffic reaches Convex directly; externally exposed conversation access (audit) is served by `apps/api`.
- AC4 (Q3): registration creates a users-permissions user; login establishes the plugin-managed refresh/httpOnly session; MVP code never stores credentials.
- AC5 (Q3/Q5): a `user`-role account sees only its own conversations; selection and history are per user.
- AC6 (Q4): an authenticated admin can list users, list any user's conversations with metadata, and read any conversation's messages; no audit mutation controls exist in v1.
- AC7 (Q4): non-admin audit attempts are denied without data disclosure.
- AC8 (Q5): changing the model selector persists the selection with the conversation and survives reopening.
- AC9 (Q5): with the provider deferred, sending persists the user message and renders the explicit placeholder; no simulated assistant content is produced or stored.
- AC10 (Q6): exactly one lockfile (`bun.lock`); CI installs with bun and a frozen lockfile; `packageManager` is declared; local targets run via bun.
- AC11 (Q7): MVP shared code lives in `lib/`; no MVP module imports `@org/*` or `packages/*` code; module-boundary lint passes.
- AC12 (Q8): one reproducible seed command populates Strapi (1 admin + >=2 users) and Convex (>=1 conversation with several messages); README documents seed and startup.
- AC13 (deliverables, Working Rule 5): `.env.example` enumerates every required variable (including `DATABASE_*`) with safe, non-secret placeholders.

### BDD scenarios (Given / When / Then)

- S1 register/login (primary): Given a visitor, When they register and log in with valid credentials, Then they reach the dashboard with an established session.
- S2 send + persistence + placeholder (primary): Given a logged-in user with a conversation and a selected model, When they send a message, Then the message is persisted in that conversation and the assistant side shows the provider-deferred placeholder.
- S3 admin audit read-only (primary): Given a logged-in admin, When they open a user's audit view, Then they see that user's conversations with metadata and can read the messages without mutation controls.
- S4 unauthenticated access (fallback): Given a visitor without a session, When they open the dashboard, Then they are redirected to login and no chat data is shown.
- S5 non-admin audit (fallback): Given a logged-in `user`-role account, When they attempt audit access, Then access is denied without data disclosure.
- S6 empty conversation list (empty state): Given a logged-in user with no conversations, When they open the dashboard, Then an explicit empty state invites starting the first chat.

## Decisions Or Evidence

Each criterion traces to the confirmed register; scenarios stay consistent with AC1-AC13 and introduce no new scope.

## Links

- Parent: `clarify.md`; contract: `clarify-proposals-core.md`; wireframes/dispositions: `clarify-assumptions.md`.
