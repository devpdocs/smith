# Clarify: Canonical Data Contract and State Rules

## Parent Phase

Clarify — main document `clarify.md` (confirmed decision register, 2026-09-07).

## Purpose

Define the canonical data contract that closes gaps G1-G7 where the confirmed decisions determine them, plus the rendering rules and empty/invalid/fallback states the product must define.

## Details

### Canonical data contract (product-level; store ownership per Q1/Q2)

- Strapi (identity + web content; store: SQLite via `better-sqlite3`):
  - User: id, username, email, password (hashed by users-permissions; never handled or stored by MVP code), role (`user` | `admin` end-user role), confirmed, blocked.
  - Session: plugin-managed refresh-token session with httpOnly cookie; MVP code validates it and never issues or stores credentials.
- Convex (conversations + session history; system of record per Q1):
  - Conversation: id, ownerUserId (reference to the Strapi user), title, modelId (selected identifier or null), createdAt, updatedAt.
  - Message: id, conversationId, role (`user` | `assistant`), content (text), createdAt. v1 persists user messages only; the assistant side is a rendered placeholder, never persisted as simulated content (Q5).

### Access edges (Q2, confirmed "Direct + external api")

- Dashboard → Convex directly via the official client for the internal chat experience.
- `apps/api` is the only externally exposed surface: Strapi session integration, the role-gated audit API, and any external-facing conversation access through Convex. Dashboard chat messages do not pass through NestJS.

### Gap-closure map

G1 closed by Q1/Q2 (storage contract above). G2 closed by Q3 (auth contract: session shape, role claims, admin role home). G3 owned by the Working Rule 5 deliverable; its content is determined by Q1/Q6/Q8. G4 closed by Q8 (seed contract). G5 closed by Q4 (audit contract: read-only, filter by user). G6 e2e scope is derived from the confirmed flows; config/specs are Plan work. G7 closed by Q7 (isolation rule; no data contract required).

### Rendering rules by type

- User message: rendered as the persisted text.
- Assistant turn: explicit "model provider deferred / not configured" placeholder; simulated or canned content is forbidden (Principle 4).
- Model selector: renders the persisted identifier; changing it persists the selection with the conversation.
- Audit views: strictly read-only lists and readers; no mutation controls rendered.

### Empty / invalid / fallback states

- Empty: no conversations → explicit empty state inviting the first chat; audited user with no conversations → explicit empty list.
- Invalid: unauthenticated access → redirect to login; non-admin audit access → denied without data disclosure; empty message send → blocked, nothing persisted; invalid credentials → generic error without user enumeration.
- Fallback: provider deferred → placeholder state (not an error); persistence unavailable → explicit unavailable state, no silent message loss.

## Decisions Or Evidence

Grounded in the confirmed decision register (Q1-Q8, 2026-09-07) and the Specify baseline facts.

## Links

- Parent: `clarify.md`; criteria/BDD: `clarify-proposals-scope.md`; wireframes/dispositions: `clarify-assumptions.md`.
