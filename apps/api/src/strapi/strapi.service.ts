import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

/** A Strapi users-permissions end-user as returned by the API. */
export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  role?: { id: number; type: string; name: string };
}

/** The MVP end-user role (Q3); a superset of the contract's UserRole. */
export type ResolvedRole = 'user' | 'admin' | null;

/**
 * Thin HTTP client over the Strapi users-permissions API (Q2/Q3; G1).
 *
 * - `getMe` validates a caller's access token by delegating to Strapi's own
 *   auth (`/api/users/me`), so apps/api never handles credentials or signs
 *   tokens (D2).
 * - `getUserRole` / `listUsers` resolve the end-user role server-side using the
 *   users-permissions admin API token (G1 decision, candidate a).
 *
 * Route correction (verified at runtime): user CRUD is at `/api/users/*`, not
 * `/api/users-permissions/users/*`.
 */
@Injectable()
export class StrapiService {
  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config.strapiUrl;
  }

  private get adminToken(): string {
    return this.config.strapiAdminToken;
  }

  /** Validates a session access token and returns the user, or null when invalid. */
  async getMe(token: string): Promise<StrapiUser | null> {
    const response = await fetch(`${this.baseUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as StrapiUser;
  }

  /** Resolves the end-user role for a user id, or null when unresolvable. */
  async getUserRole(userId: number): Promise<ResolvedRole> {
    if (!this.adminToken) {
      return null;
    }
    const response = await fetch(
      `${this.baseUrl}/api/users/${userId}?populate=role`,
      { headers: { Authorization: `Bearer ${this.adminToken}` } },
    );
    if (!response.ok) {
      return null;
    }
    const user = (await response.json()) as StrapiUser;
    const type = user.role?.type;
    return type === 'admin' || type === 'user' ? type : null;
  }

  /** Lists all users with their roles (admin audit "pick a user" step). */
  async listUsers(): Promise<StrapiUser[]> {
    if (!this.adminToken) {
      return [];
    }
    const response = await fetch(`${this.baseUrl}/api/users?populate=role`, {
      headers: { Authorization: `Bearer ${this.adminToken}` },
    });
    if (!response.ok) {
      return [];
    }
    return (await response.json()) as StrapiUser[];
  }
}
