import type { AuthResult } from './auth';

interface AuthFormOptions {
  /** Performs the page-specific auth call with the submitted credentials. */
  submit: () => Promise<AuthResult>;
}

/** Resolves a required element or throws, so types narrow to non-null. */
export function must<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Expected #${id} to exist.`);
  }
  return element as T;
}

/**
 * Wires the standard auth form (#auth-form + #error) to a page-specific auth
 * call: clears the error slot, surfaces failures, and forwards the session
 * token to the dashboard via the URL fragment (F4).
 */
export function bindAuthForm({ submit }: AuthFormOptions): void {
  const dashboardUrl =
    document.body.dataset.dashboardUrl ?? 'http://localhost:4200';
  const form = must<HTMLFormElement>('auth-form');
  const errorSlot = must<HTMLElement>('error');

  form.addEventListener('submit', async (event: SubmitEvent) => {
    event.preventDefault();
    errorSlot.hidden = true;
    errorSlot.textContent = '';

    const result = await submit();

    if (!result.ok) {
      errorSlot.textContent = result.error ?? 'Something went wrong.';
      errorSlot.hidden = false;
      return;
    }

    // Pass the Strapi session access token to the dashboard via the URL
    // fragment (F4). The dashboard reads it, persists it, then clears it.
    const token = result.token ?? '';
    window.location.assign(
      `${dashboardUrl}${token ? `#token=${encodeURIComponent(token)}` : ''}`,
    );
  });
}
