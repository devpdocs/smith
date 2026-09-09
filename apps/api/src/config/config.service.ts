import { Injectable } from '@nestjs/common';

/**
 * Typed access to runtime configuration (D2/G1).
 *
 * Values come from process.env (loaded from the repo-root `.env` by main.ts).
 * No secrets are hard-coded; defaults are safe local-development values only.
 */
@Injectable()
export class ConfigService {
  get(key: string, fallback = ''): string {
    return process.env[key] ?? fallback;
  }

  /** Base URL of the Strapi instance apps/api talks to (Q2). */
  get strapiUrl(): string {
    return this.get('STRAPI_URL', 'http://localhost:1337');
  }

  /** Users-permissions admin API token used to resolve roles server-side (G1). */
  get strapiAdminToken(): string {
    return this.get('STRAPI_ADMIN_API_TOKEN', '');
  }

  /** Convex deployment URL used for the read-only audit queries (G1). */
  get convexUrl(): string {
    return this.get('CONVEX_URL', '');
  }

  /** Port the API listens on. */
  get port(): number {
    return Number(this.get('API_PORT', '3000'));
  }
}
