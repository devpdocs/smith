import { Test } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StrapiService } from '../strapi/strapi.service';
import { ConvexService } from '../convex/convex.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  const strapi = { listUsers: vi.fn() };
  const convex = {
    listUserConversations: vi.fn(),
    listMessages: vi.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: StrapiService, useValue: strapi },
        { provide: ConvexService, useValue: convex },
      ],
    }).compile();
    service = module.get(AuditService);
    strapi.listUsers.mockReset();
    convex.listUserConversations.mockReset();
    convex.listMessages.mockReset();
  });

  it('lists users via the Strapi service', async () => {
    const users = [{ id: 1, username: 'admin' }];
    strapi.listUsers.mockResolvedValue(users);
    expect(await service.listUsers()).toEqual(users);
  });

  it("lists a user's conversations via the Convex service", async () => {
    const convs = [{ id: 'c1', title: 't', messageCount: 1 }];
    convex.listUserConversations.mockResolvedValue(convs);
    expect(await service.listUserConversations('2')).toEqual(convs);
    expect(convex.listUserConversations).toHaveBeenCalledWith('2');
  });

  it('reads messages via the Convex service', async () => {
    const msgs = [
      { id: 'm1', conversationId: 'c1', role: 'user', content: 'hi' },
    ];
    convex.listMessages.mockResolvedValue(msgs);
    expect(await service.listMessages('c1')).toEqual(msgs);
    expect(convex.listMessages).toHaveBeenCalledWith('c1');
  });
});
