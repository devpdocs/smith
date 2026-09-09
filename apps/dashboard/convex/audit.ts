import { v } from 'convex/values';
import { query } from './_generated/server';

/**
 * Read-only admin audit path (Q4; AC3/AC6).
 *
 * These queries are intentionally NOT per-user scoped: they are consumed by
 * `apps/api`, which validates the Strapi session and enforces the admin role
 * gate before delegating to Convex (Q2/Q3; AC7). No mutation operations exist
 * here — the audit is strictly read-only (Q4/AC6).
 */

/** Lists any user's conversations with metadata and message counts. */
export const auditListUserConversations = query({
  args: { ownerUserId: v.string() },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .withIndex('by_owner', (q) => q.eq('ownerUserId', args.ownerUserId))
      .order('desc')
      .collect();

    const summaries = [];
    for (const conversation of conversations) {
      const count = await ctx.db
        .query('messages')
        .withIndex('by_conversation', (q) =>
          q.eq('conversationId', conversation._id),
        )
        .collect();
      summaries.push({
        id: conversation._id,
        title: conversation.title,
        modelId: conversation.modelId,
        messageCount: count.length,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      });
    }
    return summaries;
  },
});

/** Reads the messages of any conversation (admin read-only). */
export const auditListMessages = query({
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
