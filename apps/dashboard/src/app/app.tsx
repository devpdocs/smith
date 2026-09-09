import { useEffect, useState } from 'react';
import {
  consumeTokenFromLocation,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
  fetchSessionUser,
  redirectTo,
} from '../lib/auth';
import { getMe } from '../lib/api';
import {
  deriveDashboardStatus,
  type DashboardStatus,
  type PersistenceStatus,
} from '../lib/chat';
import { ChatView } from '../views/chat-view';
import { AuditView } from '../views/audit-view';
import styles from './app.module.css';

/** Environment config passed from main.tsx (F4). */
export interface AppProps {
  /** Convex deployment URL, or null when persistence is unavailable (F3). */
  convexUrl: string | null;
  strapiUrl: string;
  apiUrl: string;
  landingUrl: string;
}

type View = 'chat' | 'audit';

/**
 * Dashboard root: consumes the Strapi session established at the landing page
 * (F4), resolves the caller's identity and role, and routes between the chat
 * view (F1-F3, direct Convex) and the admin audit view (G3, via apps/api).
 * Unauthenticated access redirects to the landing login (S4); a missing/invalid
 * persistence layer shows the explicit unavailable state (F3).
 */
export function App({ convexUrl, strapiUrl, apiUrl, landingUrl }: AppProps) {
  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [username, setUsername] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [view, setView] = useState<View>('chat');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const persistence: PersistenceStatus = convexUrl
        ? 'available'
        : 'unavailable';

      // Consume the token passed by the landing redirect, then persist it.
      const hashToken = consumeTokenFromLocation(window.location.hash);
      if (hashToken) {
        setSessionToken(hashToken);
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
      }

      const token = getSessionToken();
      if (!token) {
        if (!cancelled) {
          setStatus('unauthorized');
          redirectTo(landingUrl);
        }
        return;
      }

      // Validate the session and resolve the caller identity (D2/F4).
      const user = await fetchSessionUser(strapiUrl, token);
      if (!user) {
        if (!cancelled) {
          clearSessionToken();
          setStatus('unauthorized');
          redirectTo(landingUrl);
        }
        return;
      }

      // Resolve the caller's role via the session-identity surface.
      const me = await getMe(apiUrl, token);
      if (!me.ok) {
        if (!cancelled) {
          clearSessionToken();
          setStatus('unauthorized');
          redirectTo(landingUrl);
        }
        return;
      }

      if (cancelled) return;
      setUsername(user.username);
      setOwnerUserId(String(user.id));
      setRole(me.data.role);
      setStatus(deriveDashboardStatus(true, persistence));
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [convexUrl, strapiUrl, apiUrl, landingUrl]);

  function handleLogout() {
    clearSessionToken();
    redirectTo(landingUrl);
  }

  if (status === 'loading') {
    return <div className={styles.center}>Loading…</div>;
  }

  if (status === 'unauthorized') {
    return <div className={styles.center}>Redirecting to login…</div>;
  }

  if (status === 'unavailable') {
    return (
      <div className={styles.unavailable}>
        <h1>Persistence unavailable</h1>
        <p>
          The conversation service (Convex) is not configured for this
          environment. Check the dashboard environment variables and try again.
        </p>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    );
  }

  const token = getSessionToken() ?? '';

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.identity}>Signed in as {username}</span>
        {role === 'admin' && (
          <button
            type="button"
            className={styles.navButton}
            onClick={() => setView(view === 'audit' ? 'chat' : 'audit')}
          >
            {view === 'audit' ? 'Back to chat' : 'Admin audit'}
          </button>
        )}
        <button
          type="button"
          className={styles.navButton}
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>

      <main className={styles.content}>
        {view === 'audit' && role === 'admin' ? (
          <AuditView apiUrl={apiUrl} token={token} />
        ) : ownerUserId ? (
          <ChatView ownerUserId={ownerUserId} />
        ) : (
          <div className={styles.center}>Loading…</div>
        )}
      </main>
    </div>
  );
}

export default App;
