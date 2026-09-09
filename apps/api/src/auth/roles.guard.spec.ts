import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RolesGuard, ROLES_KEY } from './roles.guard';
import { AuthenticatedRequest } from './session.guard';

function mockContext(role?: 'user' | 'admin', required?: string[]) {
  const reflector = {
    getAllAndOverride: vi.fn((key: string) =>
      key === ROLES_KEY ? required : undefined,
    ),
  };
  const request = {
    user: role ? { id: 1, username: 'u', email: 'u@x', role } : undefined,
  } as unknown as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as Parameters<RolesGuard['canActivate']>[0];
  return { guard: new RolesGuard(reflector as unknown as Reflector), context };
}

describe('RolesGuard', () => {
  it('allows an admin on an admin-only route', () => {
    const { guard, context } = mockContext('admin', ['admin']);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a non-admin on an admin-only route', () => {
    const { guard, context } = mockContext('user', ['admin']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows any authenticated role when no role is required', () => {
    const { guard, context } = mockContext('user', undefined);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies an unauthenticated request when a role is required', () => {
    const { guard, context } = mockContext(undefined, ['admin']);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
