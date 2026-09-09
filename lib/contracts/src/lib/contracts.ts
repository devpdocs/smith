/**
 * Canonical data contract shared across the MVP apps.
 *
 * Store ownership (Q1/Q2):
 * - Identity (users, sessions) and web content live in Strapi (`apps/identity-cms`).
 * - Conversations and messages are the system of record in Convex.
 * - No MVP code writes SQLite directly for chat data (AC2).
 */

/** End-user role, distinct from Strapi Panel super-admin (Q3). */
export type UserRole = 'user' | 'admin';

/** Conversation participant message role. v1 persists user messages only (Q5/AC9). */
export type MessageRole = 'user' | 'assistant';

/** Identifier of the selected model provider, or null when none is selected (Q5). */
export type ModelId = string | null;

/** A conversation owned by a Strapi user (Q1). */
export interface Conversation {
  id: string;
  ownerUserId: string;
  title: string;
  modelId: ModelId;
  createdAt: string;
  updatedAt: string;
}

/** A message belonging to a conversation (Q1). */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

/** Metadata view used by the read-only admin audit (Q4). */
export interface ConversationSummary {
  id: string;
  title: string;
  modelId: ModelId;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/** True when `value` is a valid end-user role (Q3). */
export function isUserRole(value: unknown): value is UserRole {
  return value === 'user' || value === 'admin';
}

/** True when `value` is a valid message role (Q5). */
export function isMessageRole(value: unknown): value is MessageRole {
  return value === 'user' || value === 'assistant';
}
