import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './app/app';
import './styles.css';

// The dashboard talks directly to Convex for the chat experience (Q2). When the
// deployment URL is not configured we render the explicit persistence-unavailable
// state (F3) instead of attempting to connect. The apps/api base URL and the
// landing redirect target come from the Vite public env variables.
const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) || null;
const strapiUrl =
  (import.meta.env.VITE_STRAPI_URL as string | undefined) ??
  'http://localhost:1337';
const apiUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:3000';
const landingUrl =
  (import.meta.env.VITE_LANDING_URL as string | undefined) ??
  'http://localhost:4321';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

if (convex) {
  root.render(
    <StrictMode>
      <ConvexProvider client={convex}>
        <App
          convexUrl={convexUrl}
          strapiUrl={strapiUrl}
          apiUrl={apiUrl}
          landingUrl={landingUrl}
        />
      </ConvexProvider>
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App
        convexUrl={null}
        strapiUrl={strapiUrl}
        apiUrl={apiUrl}
        landingUrl={landingUrl}
      />
    </StrictMode>,
  );
}
