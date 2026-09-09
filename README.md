# Smith

Smith is an Nx TypeScript monorepo. This project implements an AI SaaS MVP
with an end-to-end flow: a landing page for authentication, a dashboard for
chatting with per-user conversation history, a role-gated admin audit, and a
Strapi CMS for identity.

## Architecture

| App                 | Stack             | Purpose                                                                     |
| :------------------ | :---------------- | :-------------------------------------------------------------------------- |
| `apps/landing`      | Astro             | Login / register + SaaS presentation                                        |
| `apps/dashboard`    | React + Vite      | Chat, conversation viewer/selector, model selector, admin audit UI          |
| `apps/api`          | NestJS            | Externally exposed surface: Strapi session validation, role-gated audit API |
| `apps/identity-cms` | Strapi 5 (SQLite) | Identity and web content (`user`/`admin` end-user roles)                    |
| Convex              | Convex (hosted)   | System of record for conversations and session history                      |
| `lib/contracts`     | TypeScript        | Canonical data contract (Conversation, Message, roles)                      |

Chat messages never pass through NestJS: the dashboard talks directly to
Convex, and `apps/api` is the only externally exposed surface.

## Prerequisites

- Node 24+
- [bun](https://bun.sh) (canonical package manager, pinned in `package.json`)

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create the environment files from the templates:

   ```bash
   cp .env.example .env
   cp apps/identity-cms/.env.example apps/identity-cms/.env
   ```

   Fill in real values (secrets, database, Convex). Never commit `.env` files.

3. Configure Convex (hosted service):

   ```bash
   bunx convex login
   bunx convex codegen   # generates the typed client in apps/dashboard/convex
   bunx convex dev       # run the Convex dev backend
   ```

   The dashboard and `apps/api` read `CONVEX_URL` (and `VITE_CONVEX_URL`) to
   reach the deployment. See `.env.example`.

## Running each app (dev mode)

Each app has a root script (bun canonical):

| App              | Command               | Port |
| :--------------- | :-------------------- | :--- |
| All four (one command) | `bun run dev:all` | — |
| API (NestJS)     | `bun run dev:api`       | 3000 |
| Dashboard (Vite) | `bun run dev:dashboard` | 4200 |
| Landing (Astro)  | `bun run dev:landing`   | 4321 |
| Strapi CMS       | `bun run dev:cms`       | 1337 |

`bun run dev:all` runs the four dev scripts above in parallel, one process per
app (no duplicate dashboard/port-4200 process). It is strictly a dev-server
launcher: it does NOT start Convex and does NOT run the seed. Complete the
manual prerequisites first, in this order:

1. Create the environment files from the templates:
   `cp .env.example .env` and `cp apps/identity-cms/.env.example apps/identity-cms/.env`.
2. Run the Convex hosted backend from the repo root: `bunx convex dev`
   (and `bunx convex login` / `bunx convex codegen` on first setup).
3. Have Strapi up before seeding: `bun run seed`.

- API: `http://localhost:3000`
- Dashboard: `http://localhost:4200`
- Landing: `http://localhost:4321`
- Strapi CMS: `http://localhost:1337`

## Seed data

Create the MVP test data (1 admin + regular users in Strapi, and a seeded
conversation with messages in Convex):

```bash
bun run seed
```

The seed writes the Strapi side locally and the Convex side against the
configured deployment. See `tools/seed` for details.

## Testing

```bash
# Lint, unit-test, build and type-check the MVP projects only. The frozen
# `packages/*` tree is excluded (see Notes).
bunx nx run-many -t lint test build typecheck --projects=api,dashboard,landing,identity-cms,contracts

# End-to-end (Playwright) — requires the four MVP services running and the seed
# data in place. The `e2e` target is owned by the `dashboard` project.
bunx nx run-many -t e2e --projects=api,dashboard,landing,identity-cms,contracts

# Formatting gate
bunx nx format:check --base="remotes/origin/main" --projects=api,dashboard,landing,identity-cms,contracts
```

The e2e suite (S1–S6) needs Strapi, apps/api, the dashboard and the landing
running locally (or via the Playwright `webServer`), plus the Convex deployment
reachable and seeded. See `apps/dashboard/playwright.config.mts`.

## Notes

- `packages/*` is frozen and isolated (legacy Angular shop experiment); new MVP
  code must not import from `@org/*` or `packages/*`.
- With the model provider deferred (v1), sending a message persists the user
  message only and renders an explicit "model provider deferred" placeholder;
  no simulated assistant content is produced or stored.
- If the Convex persistence layer is unavailable, the dashboard renders an
  explicit unavailable state (no silent message loss).
