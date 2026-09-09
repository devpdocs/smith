import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigService } from '../config/config.service';
import { StrapiService } from './strapi.service';

const fakeConfig = {
  strapiUrl: 'http://localhost:1337',
  strapiAdminToken: 'admin-token',
};

describe('StrapiService', () => {
  let service: StrapiService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StrapiService,
        { provide: ConfigService, useValue: fakeConfig },
      ],
    }).compile();
    service = module.get(StrapiService);
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMe', () => {
    it('returns the user when the token is valid', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
        }),
      });
      const user = await service.getMe('abc');
      expect(user).toEqual({
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:1337/api/users/me',
        { headers: { Authorization: 'Bearer abc' } },
      );
    });

    it('returns null on a non-ok response (invalid/expired session)', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 401,
      });
      expect(await service.getMe('bad')).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('resolves the admin role server-side', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 1,
          role: { id: 4, type: 'admin', name: 'admin' },
        }),
      });
      expect(await service.getUserRole(1)).toBe('admin');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:1337/api/users/1?populate=role',
        { headers: { Authorization: 'Bearer admin-token' } },
      );
    });

    it('resolves the user role', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 2,
          role: { id: 3, type: 'user', name: 'user' },
        }),
      });
      expect(await service.getUserRole(2)).toBe('user');
    });

    it('returns null when the role is unknown or missing', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 2,
          role: { id: 9, type: 'custom', name: 'x' },
        }),
      });
      expect(await service.getUserRole(2)).toBeNull();
    });
  });

  describe('listUsers', () => {
    it('lists all users with roles', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: async () => [
          { id: 1, username: 'admin', role: { type: 'admin' } },
          { id: 2, username: 'user', role: { type: 'user' } },
        ],
      });
      const users = await service.listUsers();
      expect(users).toHaveLength(2);
      expect(users[0].role?.type).toBe('admin');
    });
  });
});
