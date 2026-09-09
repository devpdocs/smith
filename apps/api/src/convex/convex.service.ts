import { Injectable } from '@nestjs/common';
import { ConvexClient } from 'convex/browser';
import type { FunctionReference } from 'convex/server';
import { ConfigService } from '../config/config.service';

/** A conversation summary returned by the read-only audit query (Q4/AC6). */
export interface ConversationSummary {
  id: string;
  title: string;
  modelId: string | null;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

/** A message returned by the read-only audit query (Q4/AC6). */
export interface AuditMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

/**
 * Read-only Convex audit client (G1). Consumes the public audit queries
 * `audit:auditListUserConversations` and `audit:auditListMessages`; the admin
 * role gate is enforced by the apps/api guards (G2). No mutation operations.
 *
 * The function names are passed as `FunctionReference` casts: the runtime accepts
 * the `module:export` string form (verified in the seed), and the generated
 * `_generated/api` reference lives in apps/dashboard's Convex directory, which
 * apps/api does not import across the app boundary. Return types are declared
 * explicitly for the audit contract.
 */
@Injectable()
export class ConvexService {
  private client: ConvexClient | null = null;

  constructor(private readonly config: ConfigService) {}

  async listUserConversations(
    ownerUserId: string,
  ): Promise<ConversationSummary[]> {
    const query =
      'audit:auditListUserConversations' as unknown as FunctionReference<'query'>;
    const result = await this.getClient().query(query, { ownerUserId });
    return result as ConversationSummary[];
  }

  async listMessages(conversationId: string): Promise<AuditMessage[]> {
    const query =
      'audit:auditListMessages' as unknown as FunctionReference<'query'>;
    const result = await this.getClient().query(query, { conversationId });
    return result as AuditMessage[];
  }

  private getClient(): ConvexClient {
    if (!this.client) {
      const url = this.config.convexUrl;
      if (!url) {
        throw new Error('CONVEX_URL is not configured.');
      }
      this.client = new ConvexClient(url);
    }
    return this.client;
  }
}
