import { test, expect } from '@playwright/test';
import { registerFromLanding, freshUserIdentity } from './auth-helpers';

/**
 * BDD S2 (send + persistence + placeholder) and S6 (empty conversation list).
 *
 * S2: Given a logged-in user with a conversation and a selected model, when they
 *     send a message, then the message is persisted and the assistant side shows
 *     the provider-deferred placeholder (AC1/AC8/AC9).
 * S6: Given a logged-in user with no conversations, when they open the dashboard,
 *     then an explicit empty state invites starting the first chat (F3).
 *
 * Each test uses a freshly registered user so its Convex state is isolated.
 */

const PROVIDER_DEFERRED =
  'Model provider deferred — replies are not configured in v1.';

test.describe('S6: empty conversation list', () => {
  test('a fresh user sees the empty state inviting the first chat', async ({
    page,
  }) => {
    const user = freshUserIdentity('s6');
    await registerFromLanding(page, user.username, user.email, user.password);

    await expect(
      page.getByText('You have no conversations yet. Start your first chat.'),
    ).toBeVisible();
  });
});

test.describe('S2: send, persist, placeholder', () => {
  test('a sent message persists and renders the provider-deferred placeholder', async ({
    page,
  }) => {
    const user = freshUserIdentity('s2');
    await registerFromLanding(page, user.username, user.email, user.password);

    // Create the first chat (empty conversation).
    await page.getByRole('button', { name: '+ New chat' }).click();
    await expect(
      page.locator('input[placeholder="Type a message…"]'),
    ).toBeVisible();

    // Send a message.
    const message = `Hello from e2e ${Date.now()}`;
    await page.locator('input[placeholder="Type a message…"]').fill(message);
    await page.getByRole('button', { name: 'Send' }).click();

    // The user message is rendered.
    await expect(page.getByText(message)).toBeVisible();
    // The assistant side shows the provider-deferred placeholder (AC9).
    await expect(page.getByText(PROVIDER_DEFERRED)).toBeVisible();

    // Persistence: after reload the message is still retrievable (AC1).
    await page.reload();
    await expect(page.getByText(/Signed in as/)).toBeVisible();
    // Re-select the conversation that was created.
    await page
      .getByRole('button', { name: 'New conversation' })
      .first()
      .click();
    await expect(page.getByText(message)).toBeVisible();
  });
});
