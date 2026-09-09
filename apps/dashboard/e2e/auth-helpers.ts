import { expect, type Page } from '@playwright/test';

/** URLs backing the MVP services (overridable for CI). */
export const URLS = {
  landing: process.env['E2E_LANDING_URL'] ?? 'http://localhost:4321',
  dashboard: process.env['E2E_DASHBOARD_URL'] ?? 'http://localhost:4200',
  api: process.env['E2E_API_URL'] ?? 'http://localhost:3000',
};

/** Seeded test accounts (I1). Override via env in a CI/live environment. */
export const SEEDED = {
  admin: {
    email: process.env['SEED_ADMIN_EMAIL'] ?? 'admin@example.com',
    password: process.env['SEED_ADMIN_PASSWORD'] ?? 'ChangeMe_Admin1',
  },
  user: {
    email: process.env['SEED_USER_EMAIL'] ?? 'user@example.com',
    password: process.env['SEED_USER_PASSWORD'] ?? 'ChangeMe_User1',
  },
};

/** Logs in via the landing login page (S1) and waits for the dashboard session. */
export async function loginFromLanding(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto(`${URLS.landing}/login`);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('#submit');
  await page.waitForURL(new RegExp(URLS.dashboard));
  await expect(page.getByText(/Signed in as/)).toBeVisible();
}

/** Registers a brand-new user via the landing register page (unique per run). */
export async function registerFromLanding(
  page: Page,
  username: string,
  email: string,
  password: string,
): Promise<void> {
  await page.goto(`${URLS.landing}/register`);
  await page.fill('#username', username);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('#submit');
  await page.waitForURL(new RegExp(URLS.dashboard));
  await expect(page.getByText(/Signed in as/)).toBeVisible();
}

/** A fresh, unique user identity so each test is isolated. */
export function freshUserIdentity(prefix: string): {
  username: string;
  email: string;
  password: string;
} {
  const suffix =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return {
    username: `${prefix}${suffix}`,
    email: `${prefix}${suffix}@example.com`,
    password: 'ChangeMe_E2E1',
  };
}

/** Returns the persisted Strapi session access token from the dashboard. */
export async function readSessionToken(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem('mvp.session.token'));
}
