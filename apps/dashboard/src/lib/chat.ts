/**
 * Dashboard chat state logic (F1/F2/F3; AC1/AC5/AC8/AC9).
 *
 * Pure helpers used by the chat view. Keeping this logic outside the React
 * components makes it unit-testable (K1) and keeps the view thin. No simulated
 * assistant content exists here (Q5/Principle 4): the only assistant output is a
 * static "provider deferred" placeholder, never persisted as a message.
 */

import type { ModelId } from '@mvp/contracts';

/** A selectable model identifier (provider deferred; no inference in v1). */
export interface ModelOption {
  id: string;
  label: string;
}

/** The selectable model identifiers (Q5: selector persists, no inference). */
export const MODEL_OPTIONS: ReadonlyArray<ModelOption> = [
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
];

/** Default selected model identifier for a new conversation. */
export const DEFAULT_MODEL_ID: string = MODEL_OPTIONS[0].id;

/** Text shown in the assistant slot when the model provider is deferred (AC9). */
export const PROVIDER_DEFERRED_TEXT =
  'Model provider deferred — replies are not configured in v1.';

/** True when `id` is one of the selectable model identifiers. */
export function isModelOption(id: string | null | undefined): id is string {
  return !!id && MODEL_OPTIONS.some((option) => option.id === id);
}

/**
 * Normalizes a persisted model id: returns a known option id, or null when the
 * value is missing or not a recognized identifier (Q5/AC8).
 */
export function normalizeModelId(value: string | null | undefined): ModelId {
  return isModelOption(value) ? value : null;
}

/** True when a non-empty message may be sent (F3: empty send blocked). */
export function canSendMessage(input: string): boolean {
  return input.trim().length > 0;
}

/** Whether the persistence (Convex) layer is available to the client. */
export type PersistenceStatus = 'available' | 'unavailable';

/** Coarse dashboard status derived from session + persistence availability. */
export type DashboardStatus =
  | 'loading' // resolving the session
  | 'unauthorized' // no/invalid session -> redirect to login (S4)
  | 'unavailable' // persistence unavailable -> explicit unavailable state (F3)
  | 'ready'; // session established and persistence available

/**
 * Derives the top-level dashboard status from whether a session token exists
 * and whether the persistence layer is available (F3/S4/S6).
 */
export function deriveDashboardStatus(
  hasSessionToken: boolean,
  persistence: PersistenceStatus,
): DashboardStatus {
  if (!hasSessionToken) return 'unauthorized';
  if (persistence === 'unavailable') return 'unavailable';
  return 'ready';
}
