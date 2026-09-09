import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMe,
  listAuditUsers,
  listUserConversations,
  listConversationMessages,
} from './api';

function mockFetchResponse(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('dashboard apps/api client', () => {
  const apiUrl = 'http://localhost:3000';
  const token = 'jwt';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getMe returns the caller identity and role from /api/me', async () => {
    const body = { id: 1, username: 'admin', email: 'a@e.com', role: 'admin' };
    const fetchMock = mockFetchResponse(200, body);
    const result = await getMe(apiUrl, token);
    expect(result).toEqual({ ok: true, data: body });
    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/api/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  });

  it('getMe surfaces a 401 as a failed result (invalid session)', async () => {
    mockFetchResponse(401, {});
    const result = await getMe(apiUrl, token);
    expect(result).toEqual({ ok: false, status: 401 });
  });

  it('listAuditUsers hits the read-only audit users endpoint', async () => {
    const users = [{ id: 2, username: 'user', role: { type: 'user' } }];
    const fetchMock = mockFetchResponse(200, users);
    const result = await listAuditUsers(apiUrl, token);
    expect(result).toEqual({ ok: true, data: users });
    expect(fetchMock).toHaveBeenCalledWith(`${apiUrl}/api/audit/users`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  });

  it('a non-admin audit call is denied without data (403, S5)', async () => {
    mockFetchResponse(403, {});
    const result = await listAuditUsers(apiUrl, token);
    expect(result).toEqual({ ok: false, status: 403 });
  });

  it('listUserConversations and listConversationMessages build the audit path', async () => {
    const convs = [{ id: 'c1', title: 't', messageCount: 1 }];
    const msgs = [
      { id: 'm1', conversationId: 'c1', role: 'user', content: 'hi' },
    ];
    // Dispatch on the URL so each endpoint returns its own body.
    const fetchMock = vi.fn((url: string) => {
      const body = url.endsWith('/messages') ? msgs : convs;
      return Promise.resolve({ ok: true, status: 200, json: async () => body });
    });
    vi.stubGlobal('fetch', fetchMock);

    expect(await listUserConversations(apiUrl, token, '7')).toEqual({
      ok: true,
      data: convs,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiUrl}/api/audit/users/7/conversations`,
      expect.any(Object),
    );

    expect(await listConversationMessages(apiUrl, token, '7', 'c1')).toEqual({
      ok: true,
      data: msgs,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${apiUrl}/api/audit/users/7/conversations/c1/messages`,
      expect.any(Object),
    );
  });
});
