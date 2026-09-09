import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

/**
 * Playwright configuration for the MVP end-to-end suite (J1; G6; condition 2).
 *
 * Discovered by the `@nx/playwright/plugin` (nx.json `targetName: e2e`), which
 * attaches an `e2e` target to the `dashboard` project. The full BDD suite
 * (S1-S6) exercises landing login/register, the dashboard chat, and the admin
 * audit end-to-end against the running MVP services.
 *
 * The suite needs the four MVP services up:
 *   - Strapi  (identity-cms)  :1337  — auth source, `user`/`admin` roles
 *   - apps/api (NestJS)      :3000  — session-identity + role-gated audit
 *   - dashboard (Vite)       :4200  — chat + audit UI (baseURL)
 *   - landing (Astro)        :4321  — login/register entry
 * Convex (the chat system of record) is the hosted deployment configured via
 * `CONVEX_URL`/`VITE_CONVEX_URL`; the seed (I1) must have been run so the
 * seeded users/conversation exist (AC12).
 */
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './e2e' }),
  /* Run sequentially with no retries so ordering with the shared Strapi/Convex
     services is deterministic and the gate is stable in CI. */
  fullyParallel: false,
  workers: 1,
  retries: 0,
  /* Shared settings for all the projects below. */
  use: {
    baseURL,
    /* Collect trace when retrying a failed test. */
    trace: 'on-first-retry',
  },
  /* The MVP services the e2e suite relies on. `reuseExistingServer` lets a
     developer reuse already-running servers for a faster local loop. */
  webServer: [
    {
      command: 'bun run dev:cms',
      url: 'http://localhost:1337/admin',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      // Strapi boot (incl. the role bootstrap) can take ~2m on a fresh box.
      timeout: 240_000,
    },
    {
      command: 'bun run dev:api',
      url: 'http://localhost:3000/api',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 120_000,
    },
    {
      command: 'bun run dev:dashboard',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 120_000,
    },
    {
      command: 'bun run dev:landing',
      url: 'http://localhost:4321',
      reuseExistingServer: true,
      cwd: workspaceRoot,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
