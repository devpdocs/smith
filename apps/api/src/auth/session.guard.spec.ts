import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StrapiService } from '../strapi/strapi.service';
import { SessionGuard, AuthenticatedRequest } from './session.guard';

function mockRequest(authHeader?: string) {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
    user: undefined,
  } as unknown as AuthenticatedRequest;
}

function mockContext(request: AuthenticatedRequest) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as Parameters<SessionGuard['canActivate']>[0];
}

describe('SessionGuard', () => {
  let guard: SessionGuard;
  const strapi = {
    getMe: vi.fn(),
    getUserRole: vi.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SessionGuard, { provide: StrapiService, useValue: strapi }],
    }).compile();
    guard = module.get(SessionGuard);
    strapi.getMe.mockReset();
    strapi.getUserRole.mockReset();
  });

  it('attaches the resolved user when the session is valid', async () => {
    strapi.getMe.mockResolvedValue({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
    });
    strapi.getUserRole.mockResolvedValue('admin');
    const request = mockRequest('Bearer token');
    await expect(guard.canActivate(mockContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    });
  });

  it('rejects a request without a bearer token', async () => {
    const request = mockRequest();
    await expect(guard.canActivate(mockContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an invalid/expired session', async () => {
    strapi.getMe.mockResolvedValue(null);
    const request = mockRequest('Bearer bad');
    await expect(guard.canActivate(mockContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects when the role cannot be resolved', async () => {
    strapi.getMe.mockResolvedValue({ id: 2, username: 'u', email: 'u@x' });
    strapi.getUserRole.mockResolvedValue(null);
    const request = mockRequest('Bearer token');
    await expect(guard.canActivate(mockContext(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
