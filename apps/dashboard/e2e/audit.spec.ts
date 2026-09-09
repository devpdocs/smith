import { test, expect } from '@playwright/test';
import {
  SEEDED,
  URLS,
  loginFromLanding,
  registerFromLanding,
  freshUserIdentity,
  readSessionToken,
} from './auth-helpers';

/**
 * BDD S3 (admin audit read-only) and S5 (non-admin denial).
 *
 * S3: Given a logged-in admin, when they open a user's audit view, then they see
 *     that user's conversations with metadata and can read the messages without
 *     mutation controls (AC3/AC6).
 * S5: Given a logged-in `user`-role account, when they attempt audit access,
 *     then access is denied without data disclosure (AC7/G2).
 */

test.describe('S3: admin audit is read-only', () => {
  test('an admin reads a user conversation and messages with no mutation controls', async ({
    page,
  }) => {
    // Create a conversation for a fresh user so the audit has data to read.
    const user = freshUserIdentity('s3');
    await registerFromLanding(page, user.username, user.email, user.password);
    await page.getByRole('button', { name: '+ New chat' }).click();
    await page.locator('input[placeholder="Type a message…"]').fill('Audit me');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Audit me')).toBeVisible();
    // Log out of the fresh-user session.
    await page.getByRole('button', { name: 'Log out' }).click();

    // Log in as the seeded admin.
    await loginFromLanding(page, SEEDED.admin.email, SEEDED.admin.password);

    // Open the admin audit view.
    await page.getByRole('button', { name: 'Admin audit' }).click();
    await expect(page.getByText('Audit — admin only')).toBeVisible();

    // Select the freshly created user.
    await page.getByRole('button', { name: user.username }).click();
    // Their conversation with metadata (message count) is listed.
    await expect(page.getByText('New conversation')).toBeVisible();
    await expect(page.getByText('1 message')).toBeVisible();

    // Read the messages.
    await page
      .getByRole('button', { name: 'New conversation' })
      .first()
      .click();
    await expect(page.getByText('Audit me')).toBeVisible();

    // No mutation controls are rendered (Q4/AC6) — no delete/edit/remove buttons.
    await expect(
      page.getByRole('button', { name: /delete|edit|remove|moderate/i }),
    ).toHaveCount(0);
  });
});

test.describe('S5: non-admin audit access is denied', () => {
  test('a user-role account gets no audit UI and a 403 from the audit API', async ({
    page,
    request,
  }) => {
    // Log in as the seeded regular user (user role).
    await loginFromLanding(page, SEEDED.user.email, SEEDED.user.password);

    // The audit nav is not shown to non-admins (no data disclosure, G2).
    await expect(page.getByRole('button', { name: 'Admin audit' })).toHaveCount(
      0,
    );

    // Directly probing the audit API is denied (403, never disclosed data).
    const token = await readSessionToken(page);
    expect(token).toBeTruthy();
    const response = await request.get(`${URLS.api}/api/audit/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
  });
});
