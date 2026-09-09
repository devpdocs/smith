import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Convex schema for the MVP (E2).
 *
 * Store ownership (Q1): conversations and messages are the system of record in
 * Convex; no MVP code writes SQLite directly for chat data (AC2).
 *
 * The canonical data contract (clarify-proposals-core.md) maps to these tables:
 * - Conversation -> conversations table (_id is the conversation id)
 * - Message -> messages table (_id is the message id)
 * - ownerUserId references the Strapi users-permissions user id (Q1).
 * - role is `user` | `assistant`; v1 persists user messages only (Q5/AC9).
 * - modelId is the selected model identifier or null (Q5/AC8).
 */
export default defineSchema({
  conversations: defineTable({
    ownerUserId: v.string(),
    title: v.string(),
    modelId: v.union(v.string(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_owner', ['ownerUserId']),
  messages: defineTable({
    conversationId: v.id('conversations'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_conversation', ['conversationId']),
});
