import { test, expect } from '@playwright/test';
import { SEEDED, URLS, loginFromLanding } from './auth-helpers';

/**
 * BDD S1 (register/login) and S4 (unauthenticated redirect).
 *
 * S1: Given a visitor, when they log in with valid credentials, then they reach
 *     the dashboard with an established session (AC4).
 * S4: Given a visitor without a session, when they open the dashboard, then
 *     they are redirected to the landing login and no chat data is shown (F3).
 */

test.describe('S1: login establishes the dashboard session', () => {
  test('a seeded user can log in and reach the dashboard', async ({ page }) => {
    await loginFromLanding(page, SEEDED.user.email, SEEDED.user.password);

    // The top bar shows the resolved identity (F4).
    await expect(page.getByText(/Signed in as/)).toBeVisible();
    // The chat view is reachable (conversation sidebar present).
    await expect(page.getByText('Conversations')).toBeVisible();
  });
});

test.describe('S4: unauthenticated access redirects to login', () => {
  test('opening the dashboard without a session redirects to the landing login', async ({
    page,
  }) => {
    // No token in this fresh context.
    await page.goto(`${URLS.dashboard}/`);
    await page.waitForURL(new RegExp(`${URLS.landing}/login`));

    // The landing login form is shown, not any chat data.
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});
