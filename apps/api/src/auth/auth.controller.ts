import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionGuard } from './session.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthUser } from './session.guard';

/**
 * Session-identity surface (D2; supports F4/G3).
 *
 * Exposes the validated caller's identity plus its server-resolved end-user
 * role so the dashboard can decide whether to show the admin audit UI. The
 * route reuses `SessionGuard` (delegates session validation to Strapi, then
 * resolves the role server-side) and returns the already-gated `request.user`;
 * it performs no credential/signing handling and makes no mutation.
 */
@Controller('me')
@UseGuards(SessionGuard)
export class AuthController {
  @Get()
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
