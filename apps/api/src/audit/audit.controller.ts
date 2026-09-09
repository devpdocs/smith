import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { SessionGuard } from '../auth/session.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Admin } from '../auth/roles.decorator';

/**
 * Admin-only read-only audit endpoints (G1/G2).
 *
 * All routes are gated by SessionGuard (validates the Strapi session) then
 * RolesGuard + @Admin() (rejects non-admin without disclosing data). Each route
 * is read-only; no mutation operations exist (Q4/AC6).
 */
@Controller('audit')
@UseGuards(SessionGuard, RolesGuard)
@Admin()
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  /** Lists all end-users (admin "pick a user" step). */
  @Get('users')
  listUsers() {
    return this.audit.listUsers();
  }

  /** Lists a single user's conversations with metadata and message counts. */
  @Get('users/:userId/conversations')
  listUserConversations(@Param('userId') userId: string) {
    return this.audit.listUserConversations(userId);
  }

  /** Reads the messages of one of a user's conversations. */
  @Get('users/:userId/conversations/:conversationId/messages')
  listMessages(@Param('conversationId') conversationId: string) {
    return this.audit.listMessages(conversationId);
  }
}
