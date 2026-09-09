import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';
import { SessionGuard, AuthUser } from './session.guard';
import { StrapiService } from '../strapi/strapi.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [SessionGuard, { provide: StrapiService, useValue: {} }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('returns the validated caller identity and role (me)', () => {
    const user: AuthUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
    };
    expect(controller.me(user)).toEqual(user);
  });

  it('preserves a user-role caller without elevating', () => {
    const user: AuthUser = {
      id: 2,
      username: 'user',
      email: 'user@example.com',
      role: 'user',
    };
    expect(controller.me(user).role).toBe('user');
  });
});
