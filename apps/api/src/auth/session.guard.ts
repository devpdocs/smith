import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StrapiService } from '../strapi/strapi.service';

/** The authenticated end-user attached to the request by SessionGuard. */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

/** Request augmented with the resolved authenticated user. */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

/**
 * Validates a Strapi session access token (D2/G1).
 *
 * Delegates validation to Strapi's own auth (`/api/users/me`), then resolves the
 * end-user role server-side via the users-permissions admin API. A missing/invalid
 * token or an unresolvable role yields 401 — no data is disclosed (G2).
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly strapi: StrapiService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token.');
    }
    const token = header.slice('Bearer '.length);
    const user = await this.strapi.getMe(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired session.');
    }
    const role = await this.strapi.getUserRole(user.id);
    if (!role) {
      throw new UnauthorizedException('Could not resolve user role.');
    }
    request.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role,
    };
    return true;
  }
}
