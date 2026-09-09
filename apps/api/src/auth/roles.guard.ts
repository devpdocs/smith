import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@mvp/contracts';
import type { AuthenticatedRequest } from './session.guard';

/** Metadata key holding the roles required by a route. */
export const ROLES_KEY = 'roles';

/**
 * Enforces a role gate based on the `@Roles(...)` metadata. Requires the
 * request to carry a `user` with a resolved role (set by SessionGuard).
 * Non-admins get 403 without any data disclosure (Q4/AC7/G2/S5).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const role = request.user?.role;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Insufficient permissions.');
    }
    return true;
  }
}
