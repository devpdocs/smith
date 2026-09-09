export interface AuthResult {
  ok: boolean;
  error?: string;
  /** The Strapi session access token (JWT) issued on success (Q3/F4). */
  token?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

const GENERIC_ERROR =
  'Invalid credentials. Please check your details and try again.';

async function post(
  baseUrl: string,
  path: string,
  body: unknown,
): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
}

/**
 * Signs in with the Strapi users-permissions local strategy.
 * Never surfaces the provider's specific error to avoid user enumeration (S1/AC4).
 */
export async function login(
  baseUrl: string,
  credentials: LoginCredentials,
): Promise<AuthResult> {
  const response = await post(baseUrl, '/api/auth/local', {
    identifier: credentials.identifier,
    password: credentials.password,
  });
  if (!response.ok) {
    return { ok: false, error: GENERIC_ERROR };
  }
  const data = (await response.json()) as { jwt?: string };
  return { ok: true, token: data.jwt };
}

/**
 * Registers a new Strapi users-permissions user. Registration always produces a
 * `user`-role account (D1); admin role is assigned only via the seed (Q3).
 */
export async function register(
  baseUrl: string,
  credentials: RegisterCredentials,
): Promise<AuthResult> {
  const response = await post(baseUrl, '/api/auth/local/register', {
    username: credentials.username,
    email: credentials.email,
    password: credentials.password,
  });
  if (!response.ok) {
    return { ok: false, error: GENERIC_ERROR };
  }
  const data = (await response.json()) as { jwt?: string };
  return { ok: true, token: data.jwt };
}
