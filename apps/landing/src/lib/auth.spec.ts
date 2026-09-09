import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login, register } from './auth';

describe('auth', () => {
  const baseUrl = 'http://strapi.test';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetch(response: { ok: boolean; status?: number }) {
    const fn = vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 400),
      json: async () => (response.ok ? { jwt: 'jwt-token' } : {}),
    });
    vi.stubGlobal('fetch', fn);
    return fn;
  }

  describe('login', () => {
    it('posts to the Strapi local auth endpoint with credentials', async () => {
      const fetchMock = mockFetch({ ok: true });
      const result = await login(baseUrl, {
        identifier: 'user@example.com',
        password: 'secret',
      });

      expect(result.ok).toBe(true);
      expect(result.error).toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/api/auth/local`,
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            identifier: 'user@example.com',
            password: 'secret',
          }),
        }),
      );
    });

    it('returns a generic error without user enumeration on failure', async () => {
      mockFetch({ ok: false, status: 401 });
      const result = await login(baseUrl, {
        identifier: 'unknown@example.com',
        password: 'wrong',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });
  });

  describe('register', () => {
    it('posts to the Strapi register endpoint and returns success', async () => {
      const fetchMock = mockFetch({ ok: true });
      const result = await register(baseUrl, {
        username: 'newuser',
        email: 'new@example.com',
        password: 'secret',
      });

      expect(result.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/api/auth/local/register`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'newuser',
            email: 'new@example.com',
            password: 'secret',
          }),
        }),
      );
    });

    it('returns a generic error without leaking provider details', async () => {
      mockFetch({ ok: false, status: 400 });
      const result = await register(baseUrl, {
        username: 'taken',
        email: 'taken@example.com',
        password: 'secret',
      });

      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid credentials');
    });
  });
});
