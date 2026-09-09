import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SESSION_TOKEN_KEY,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
  consumeTokenFromLocation,
  fetchSessionUser,
  redirectTo,
} from './auth';

describe('dashboard auth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  describe('session token persistence', () => {
    it('stores and reads the access token', () => {
      setSessionToken('jwt-token');
      expect(getSessionToken()).toBe('jwt-token');
      expect(window.localStorage.getItem(SESSION_TOKEN_KEY)).toBe('jwt-token');
    });

    it('clears the access token', () => {
      setSessionToken('jwt-token');
      clearSessionToken();
      expect(getSessionToken()).toBeNull();
      expect(window.localStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
    });

    it('returns null when no token is stored', () => {
      expect(getSessionToken()).toBeNull();
    });
  });

  describe('consumeTokenFromLocation', () => {
    it('extracts a token from the landing redirect fragment', () => {
      expect(consumeTokenFromLocation('#token=abc%20123')).toBe('abc 123');
    });

    it('returns null when no token fragment is present', () => {
      expect(consumeTokenFromLocation('#other=1')).toBeNull();
      expect(consumeTokenFromLocation('')).toBeNull();
    });
  });

  describe('fetchSessionUser', () => {
    it('resolves the user via the Strapi me endpoint', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 7,
          username: 'user',
          email: 'user@example.com',
        }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const user = await fetchSessionUser('http://strapi.test', 'token');
      expect(user).toEqual({
        id: 7,
        username: 'user',
        email: 'user@example.com',
      });
      expect(fetchMock).toHaveBeenCalledWith(
        'http://strapi.test/api/users/me',
        { headers: { Authorization: 'Bearer token' } },
      );
    });

    it('returns null when the session is invalid', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, status: 401 }),
      );
      expect(await fetchSessionUser('http://strapi.test', 'bad')).toBeNull();
    });
  });

  describe('redirectTo', () => {
    it('navigates to the landing URL for unauthenticated access (S4)', () => {
      const replace = vi.fn();
      vi.stubGlobal('location', { replace });
      redirectTo('http://localhost:4321');
      expect(replace).toHaveBeenCalledWith('http://localhost:4321');
    });
  });
});
