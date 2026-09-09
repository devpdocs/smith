/**
 * apps/api client for the dashboard (F4/G3).
 *
 * The dashboard talks directly to Convex for the chat experience (Q2), but the
 * admin audit and the session-identity resolution (`/api/me`) are served by
 * `apps/api`, the only externally exposed surface. Every call authenticates
 * with the caller's Strapi session access token; access is denied by apps/api
 * (G2) when the caller is not an admin — no data is disclosed (AC7/S5).
 */

import type { MessageRole } from '@mvp/contracts';

/** The caller identity resolved by apps/api `GET /api/me` (D2). */
export interface MeIdentity {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

/** A Strapi users-permissions end-user as returned by the audit list (G1). */
export interface AuditUser {
  id: number;
  username: string;
  email: string;
  role?: { id: number; type: string; name: string };
}

/** A user's conversation summary (metadata + message count) from the audit. */
export interface AuditConversationSummary {
  id: string;
  title: string;
  modelId: string | null;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

/** A message read via the audit reader (G3 read-only). */
export interface AuditMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

/** A discriminated result for an apps/api call. */
export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; status: number };

function encode(value: string): string {
  return encodeURIComponent(value);
}

async function apiGet<T>(
  apiUrl: string,
  token: string,
  path: string,
): Promise<ApiResult<T>> {
  const response = await fetch(`${apiUrl}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, data: (await response.json()) as T };
}

/** Resolves the caller's identity + server-resolved role (D2; F4). */
export function getMe(
  apiUrl: string,
  token: string,
): Promise<ApiResult<MeIdentity>> {
  return apiGet<MeIdentity>(apiUrl, token, '/me');
}

/** Lists all end-users (admin audit "pick a user" step). */
export function listAuditUsers(
  apiUrl: string,
  token: string,
): Promise<ApiResult<AuditUser[]>> {
  return apiGet<AuditUser[]>(apiUrl, token, '/audit/users');
}

/** Lists one user's conversations with metadata and message counts. */
export function listUserConversations(
  apiUrl: string,
  token: string,
  userId: string,
): Promise<ApiResult<AuditConversationSummary[]>> {
  return apiGet<AuditConversationSummary[]>(
    apiUrl,
    token,
    `/audit/users/${encode(userId)}/conversations`,
  );
}

/** Reads the messages of one of a user's conversations (read-only). */
export function listConversationMessages(
  apiUrl: string,
  token: string,
  userId: string,
  conversationId: string,
): Promise<ApiResult<AuditMessage[]>> {
  return apiGet<AuditMessage[]>(
    apiUrl,
    token,
    `/audit/users/${encode(userId)}/conversations/${encode(conversationId)}/messages`,
  );
}
