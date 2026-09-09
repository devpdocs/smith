import { Injectable } from '@nestjs/common';
import { StrapiService, StrapiUser } from '../strapi/strapi.service';
import {
  AuditMessage,
  ConvexService,
  ConversationSummary,
} from '../convex/convex.service';

/**
 * Read-only admin audit service (G1).
 *
 * Combines the Strapi users-permissions API (list users + resolve roles) with
 * the Convex read-only audit queries (list a user's conversations and read
 * their messages). No mutation operations are exposed.
 */
@Injectable()
export class AuditService {
  constructor(
    private readonly strapi: StrapiService,
    private readonly convex: ConvexService,
  ) {}

  listUsers(): Promise<StrapiUser[]> {
    return this.strapi.listUsers();
  }

  listUserConversations(ownerUserId: string): Promise<ConversationSummary[]> {
    return this.convex.listUserConversations(ownerUserId);
  }

  listMessages(conversationId: string): Promise<AuditMessage[]> {
    return this.convex.listMessages(conversationId);
  }
}
