# Clarify: ASCII Wireframes and Assumption Dispositions

## Parent Phase

Clarify — main document `clarify.md` (confirmed decision register, 2026-09-07).

## Purpose

Record low-fidelity wireframes for the agreed screens (structure, not style) and the explicit replacement of assumptions A1-A10 by confirmed decisions.

## Details

### Landing — login/register
+--------------------------------------------------+
| Smith AI SaaS (Astro landing)                    |
| Value proposition one-liner · [ Log in ] [ Register ] |
| Panel (two modes): Email/Password                |
|  (register mode adds) Username                   |
|  [ Submit ]  error slot: generic message         |
+--------------------------------------------------+

### Dashboard — chat + conversation viewer/selector + model selector
+---------------------------------------------------------------+
| Top bar: user identity  [ Log out ]                           |
+----------------+----------------------------------------------+
| Conversations  | Chat pane                                    |
| [ + New chat ] | Title .......... Model: [ selector v ]       |
|  Conversation A| user: message text                           |
|  (empty state: | (assistant slot: provider-deferred notice)   |
|  start first   |----------------------------------------------|
|  chat          | Composer: [ message input ]  [ Send ]        |
+----------------+----------------------------------------------+

### Admin audit (read-only, role-gated)
+---------------------------------------------------------------+
| Audit — admin only                                            |
| Users: [ user1 ] [ user2 ] [ admin ]     filter: user v       |
+-------------------+-------------------------------------------+
| Selected user's   | Message reader (read-only)                |
| conversations     | user: message text ...                    |
| (title, dates,    | no mutation controls rendered             |
|  counts)          |                                           |
+-------------------+-------------------------------------------+

### Assumption dispositions (replaced/kept by confirmed decisions)
- A1 → replaced by Q3: users-permissions is the confirmed single auth source.
- A2 → confirmed by Q1: split stores (Strapi/SQLite + Convex).
- A3 → confirmed by Q7: `packages/*` frozen and isolated.
- A4 → confirmed by Q7: `lib/` is the shared-code home.
- A5/A6 → kept: Vitest co-located convention (WR7) and the full CI gate (WR8) bind new apps; e2e scope derives from confirmed flows.
- A7 → refined: local run without Docker; toolchain via bun (Q6); Convex via its dev CLI.
- A8 → refined: `release.projects: ["api"]` targets the future `apps/api`; corrected explicitly in Plan.
- A9 → refined: Node 24 runtime stands; consistent with Q6 = bun.
- A10 → confirmed by Q5: selector persists data, no inference; UI-only rejected.

## Decisions Or Evidence
Dispositions are grounded in the confirmed register; wireframes reflect the Q1-Q5 screens only.

## Links
- Parent: `clarify.md`; contract: `clarify-proposals-core.md`; criteria/BDD: `clarify-proposals-scope.md`.
