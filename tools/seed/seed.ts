/**
 * MVP seed (I1 / Q8 / AC12).
 *
 * Creates reproducible test data across both stores:
 * - Strapi (apps/identity-cms): 1 admin + >=2 regular users, safe placeholder
 *   credentials. Regular users get the `user` end-user role (D1); the admin
 *   user is promoted to the `admin` end-user role.
 * - Convex: >=1 conversation with several messages (execution requires a
 *   configured deployment — see notes).
 *
 * The seed is idempotent: re-running it with pre-existing users does not fail.
 * Users are resolved by username/email via the users-permissions admin API and
 * the admin user is promoted to the `admin` role whether it was just created or
 * already existed. The Convex welcome conversation is seeded once (skipped when
 * it already exists).
 *
 * Usage:
 *   bun run seed
 *
 * Reads env from the root `.env` (see `.env.example`).
 */
import { ConvexClient } from 'convex/browser';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const CONVEX_URL = process.env.CONVEX_URL ?? '';
const ADMIN_API_TOKEN = process.env.STRAPI_ADMIN_API_TOKEN ?? '';

const ADMIN_USER = {
  username: process.env.SEED_ADMIN_USERNAME ?? 'admin',
  email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe_Admin1',
};

const REGULAR_USERS = [
  {
    username: process.env.SEED_USER_USERNAME ?? 'user',
    email: process.env.SEED_USER_EMAIL ?? 'user@example.com',
    password: process.env.SEED_USER_PASSWORD ?? 'ChangeMe_User1',
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'ChangeMe_User2',
  },
];

interface StrapiUser {
  id: number;
  username: string;
  email: string;
  role?: { id: number; type: string; name: string };
}

async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_API_TOKEN}`,
      ...(init.headers ?? {}),
    },
  });
}

/** Resolves an existing user by username or email via the admin API. */
async function resolveExistingUser(
  username: string,
  email: string,
): Promise<StrapiUser | null> {
  if (!ADMIN_API_TOKEN) {
    return null;
  }
  for (const filter of [
    `filters[username][$eq]=${encodeURIComponent(username)}`,
    `filters[email][$eq]=${encodeURIComponent(email)}`,
  ]) {
    const response = await apiFetch(`/api/users?${filter}`);
    if (!response.ok) {
      console.warn(`resolve ${username} failed: ${response.status}`);
      return null;
    }
    const data = (await response.json()) as StrapiUser[];
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
  }
  return null;
}

/** Registers a new user. Returns the new user id or null on failure. */
async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<number | null> {
  const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const text = await response.text();
    console.warn(`register ${username} failed: ${response.status} ${text}`);
    return null;
  }
  const data = (await response.json()) as { user: { id: number } };
  return data.user.id;
}

/**
 * Ensures a user exists (resolving an existing one or registering a new one)
 * and returns its Strapi user id. Idempotent: never fails on a pre-existing
 * user.
 */
async function ensureUser(
  username: string,
  email: string,
  password: string,
): Promise<number | null> {
  const existing = await resolveExistingUser(username, email);
  if (existing) {
    console.log(`User ${username} already exists (id ${existing.id}).`);
    return existing.id;
  }
  return registerUser(username, email, password);
}

async function promoteToAdmin(userId: number): Promise<boolean> {
  if (!ADMIN_API_TOKEN) {
    console.warn(
      'STRAPI_ADMIN_API_TOKEN not set — cannot promote the admin user to the `admin` role. Set it in .env (create a users-permissions API token in the Strapi admin panel).',
    );
    return false;
  }
  const rolesResponse = await apiFetch('/api/users-permissions/roles');
  if (!rolesResponse.ok) {
    console.warn(`list roles failed: ${rolesResponse.status}`);
    return false;
  }
  const roles = (await rolesResponse.json()) as {
    roles?: Array<{ id: number; name: string; type: string }>;
  };
  const adminRole = (roles.roles ?? []).find((role) => role.type === 'admin');
  if (!adminRole) {
    console.warn('admin role not found — run the Strapi bootstrap first.');
    return false;
  }

  // Read the current role so the promotion is a no-op when already admin.
  const userResponse = await apiFetch(`/api/users/${userId}?populate=role`);
  if (userResponse.ok) {
    const user = (await userResponse.json()) as StrapiUser;
    if (user.role?.type === 'admin') {
      console.log(`User ${userId} is already an admin — no change needed.`);
      return true;
    }
  }

  const updateResponse = await apiFetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role: adminRole.id }),
  });
  if (!updateResponse.ok) {
    console.warn(`promote ${userId} to admin failed: ${updateResponse.status}`);
    return false;
  }
  console.log(`Promoted user ${userId} to the admin role.`);
  return true;
}

async function seedStrapi(): Promise<void> {
  console.log(`Seeding Strapi at ${STRAPI_URL}...`);

  const adminId = await ensureUser(
    ADMIN_USER.username,
    ADMIN_USER.email,
    ADMIN_USER.password,
  );
  if (adminId) {
    await promoteToAdmin(adminId);
  }

  for (const user of REGULAR_USERS) {
    await ensureUser(user.username, user.email, user.password);
  }

  console.log('Strapi seed complete.');
}

async function seedConvex(): Promise<void> {
  if (!CONVEX_URL) {
    console.log(
      'Convex seeding skipped: CONVEX_URL not set. Configure the Convex deployment (bunx convex login, bunx convex dev) and set CONVEX_URL.',
    );
    return;
  }
  const client = new ConvexClient(CONVEX_URL);
  console.log(`Seeding Convex at ${CONVEX_URL}...`);

  // Idempotent: skip seeding when a welcome conversation already exists.
  const existing = (await client.query('conversations:listOwnConversations', {
    ownerUserId: 'seed-user',
  })) as Array<{ _id: string; title: string }>;
  const welcome = existing.find((c) => c.title === 'Welcome conversation');
  if (welcome) {
    console.log(
      `Welcome conversation already exists (id ${welcome._id}) — skipping.`,
    );
    client.close();
    return;
  }

  const conversationId = await client.mutation('conversations:createConversation', {
    ownerUserId: 'seed-user',
    title: 'Welcome conversation',
    modelId: null,
  });
  for (let i = 1; i <= 3; i += 1) {
    await client.mutation('conversations:sendMessage', {
      conversationId,
      role: 'user',
      content: `Seed message ${i}`,
    });
  }
  client.close();
  console.log('Convex seed complete.');
}

async function main(): Promise<void> {
  await seedStrapi();
  await seedConvex();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
