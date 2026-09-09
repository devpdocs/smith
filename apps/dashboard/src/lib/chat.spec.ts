import { describe, expect, it } from 'vitest';
import {
  MODEL_OPTIONS,
  DEFAULT_MODEL_ID,
  PROVIDER_DEFERRED_TEXT,
  isModelOption,
  normalizeModelId,
  canSendMessage,
  deriveDashboardStatus,
} from './chat';

describe('dashboard chat logic', () => {
  describe('model options (Q5/AC8)', () => {
    it('exposes selectable model identifiers', () => {
      expect(MODEL_OPTIONS.length).toBeGreaterThan(0);
      expect(DEFAULT_MODEL_ID).toBe(MODEL_OPTIONS[0].id);
    });

    it('recognizes a known model id', () => {
      expect(isModelOption('gpt-4o')).toBe(true);
    });

    it('rejects unknown/missing ids', () => {
      expect(isModelOption('unknown-model')).toBe(false);
      expect(isModelOption(null)).toBe(false);
      expect(isModelOption(undefined)).toBe(false);
    });

    it('normalizes a known id but nulls an unknown one (persisted selection)', () => {
      expect(normalizeModelId('claude-3-5-sonnet')).toBe('claude-3-5-sonnet');
      expect(normalizeModelId('nope')).toBeNull();
      expect(normalizeModelId(null)).toBeNull();
    });
  });

  describe('send validation (F3/AC9)', () => {
    it('allows a non-empty message', () => {
      expect(canSendMessage('hello')).toBe(true);
    });

    it('blocks empty/whitespace messages without persisting', () => {
      expect(canSendMessage('')).toBe(false);
      expect(canSendMessage('   ')).toBe(false);
    });
  });

  describe('provider-deferred placeholder (AC9)', () => {
    it('does not produce simulated assistant content', () => {
      expect(PROVIDER_DEFERRED_TEXT).toContain('deferred');
    });
  });

  describe('dashboard status derivation (F3/S4/S6)', () => {
    it('redirects (unauthorized) when there is no session token', () => {
      expect(deriveDashboardStatus(false, 'available')).toBe('unauthorized');
    });

    it('shows the unavailable state when persistence is unavailable', () => {
      expect(deriveDashboardStatus(true, 'unavailable')).toBe('unavailable');
    });

    it('is ready when a session and persistence are available', () => {
      expect(deriveDashboardStatus(true, 'available')).toBe('ready');
    });
  });
});
