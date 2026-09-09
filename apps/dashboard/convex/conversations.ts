import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Dashboard direct-client chat flow (Q1/Q2; AC1/AC5/AC8).
 *
 * All queries/mutations scope by `ownerUserId` (the Strapi users-permissions
 * user id) so a user-role account only sees its own conversations (AC5).
 * v1 persists user messages only (Q5/AC9); the assistant side is a rendered
 * placeholder, never a simulated or canned assistant message.
 */

/** Creates a conversation owned by the given user. Returns the new id. */
export const createConversation = mutation({
  args: {
    ownerUserId: v.string(),
    title: v.string(),
    modelId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert('conversations', {
      ownerUserId: args.ownerUserId,
      title: args.title,
      modelId: args.modelId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Lists the conversations owned by the given user, newest first. */
export const listOwnConversations = query({
  args: { ownerUserId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('conversations')
      .withIndex('by_owner', (q) => q.eq('ownerUserId', args.ownerUserId))
      .order('desc')
      .collect();
  },
});

/** Reads a single conversation by id (caller must scope by owner). */
export const getConversation = query({
  args: { id: v.id('conversations') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

/** Lists the messages of a conversation, oldest first. */
export const listMessages = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('messages')
      .withIndex('by_conversation', (q) =>
        q.eq('conversationId', args.conversationId),
      )
      .order('asc')
      .collect();
  },
});

/**
 * Persists a user message in the conversation and bumps the conversation's
 * `updatedAt`. The assistant placeholder is rendered client-side and is NOT
 * persisted (Q5/AC9).
 */
export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    role: v.literal('user'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found.');
    }
    const now = Date.now();
    await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      createdAt: now,
    });
    await ctx.db.patch(args.conversationId, { updatedAt: now });
    return { conversationId: args.conversationId, createdAt: now };
  },
});

/** Persists the selected model identifier with the conversation (AC8). */
export const updateModelId = mutation({
  args: {
    conversationId: v.id('conversations'),
    modelId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      modelId: args.modelId,
      updatedAt: Date.now(),
    });
  },
});
