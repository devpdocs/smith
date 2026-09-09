#!/usr/bin/env bash
# dev-all.sh
# Launch the four MVP dev servers in parallel by reusing the existing root
# scripts (single source of truth): dev:api, dev:dashboard, dev:landing,
# dev:cms. Exactly one process per app — never two targets against the
# dashboard (a prior combined attempt ran both `dev` and `serve` there and
# provoked a port-4200 conflict, so it was removed).
#
# Manual prerequisites — NOT handled here. Do these first (in order):
#   1. Create the environment files from the templates:
#        cp .env.example .env
#        cp apps/identity-cms/.env.example apps/identity-cms/.env
#   2. Run the Convex hosted backend from the repo root (this is where
#      convex.json / .env.local live):
#        bunx convex login
#        bunx convex codegen
#        bunx convex dev
#   3. Have Strapi up before seeding (only if you need the seed):
#        bun run seed
#   This script only runs the four dev servers; it does NOT run Convex or
#   the seed.
#
# Usage:  bun run dev:all
# Stop:   Ctrl+C — SIGINT reaches all four backgrounded processes.

bun run dev:api &
bun run dev:dashboard &
bun run dev:landing &
bun run dev:cms &

wait
