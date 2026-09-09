/**
 * Dashboard session helpers (F4; AC4/AC5).
 *
 * The dashboard consumes the Strapi session access token that the landing app
 * passes via the URL fragment (`#token=...`) after a successful login/register.
 * The token is persisted locally so the chat view can reach Convex (with the
 * caller's Strapi user id) and so the audit view can authenticate to apps/api.
 * No credentials are ever handled by the dashboard (Q2/Q3).
 */

export const SESSION_TOKEN_KEY = 'mvp.session.token';

/** The end-user identity resolved from the Strapi session (D2/F4). */
export interface SessionUser {
  id: number;
  username: string;
  email: string;
}

/** Reads the persisted session access token, if any. */
export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
}

/** Persists the session access token. */
export function setSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_TOKEN_KEY, token);
}

/** Clears the persisted session access token. */
export function clearSessionToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Extracts the access token from the landing redirect fragment (`#token=...`)
 * and returns it. The caller clears the fragment after persisting the token.
 */
export function consumeTokenFromLocation(hash: string): string | null {
  const match = /#token=([^&]+)/.exec(hash);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Resolves the Strapi user for a session token by delegating to Strapi's own
 * `/api/users/me` (no credential handling). Returns null when the session is
 * not valid.
 */
export async function fetchSessionUser(
  strapiUrl: string,
  token: string,
): Promise<SessionUser | null> {
  const response = await fetch(`${strapiUrl}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as {
    id: number;
    username: string;
    email: string;
  };
  return { id: data.id, username: data.username, email: data.email };
}

/** Navigates the browser to a URL (used for the login redirect, S4). */
export function redirectTo(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.replace(url);
}
