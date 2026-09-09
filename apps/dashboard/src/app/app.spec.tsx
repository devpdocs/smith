import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './app';

function stubFetch() {
  const fetchMock = vi.fn((url: string) => {
    if (url.endsWith('/api/users/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
        }),
      });
    }
    if (url.endsWith('/api/me')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        }),
      });
    }
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders the persistence-unavailable state when Convex is not configured (F3)', async () => {
    window.localStorage.setItem('mvp.session.token', 'jwt-token');
    stubFetch();

    render(
      <App
        convexUrl={null}
        strapiUrl="http://strapi.test"
        apiUrl="http://api.test"
        landingUrl="http://landing.test"
      />,
    );

    expect(await screen.findByText('Persistence unavailable')).toBeTruthy();
  });

  it('redirects (unauthorized) when there is no session token (S4)', async () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { hash: '', pathname: '/', search: '', replace });

    render(
      <App
        convexUrl={null}
        strapiUrl="http://strapi.test"
        apiUrl="http://api.test"
        landingUrl="http://landing.test"
      />,
    );

    expect(await screen.findByText('Redirecting to login…')).toBeTruthy();
    expect(replace).toHaveBeenCalledWith('http://landing.test');
  });
});
