import { isMessageRole, isUserRole } from './contracts';

describe('contracts', () => {
  describe('isUserRole', () => {
    it('accepts known end-user roles', () => {
      expect(isUserRole('user')).toBe(true);
      expect(isUserRole('admin')).toBe(true);
    });

    it('rejects unknown values and other role strings', () => {
      expect(isUserRole('super-admin')).toBe(false);
      expect(isUserRole(42)).toBe(false);
      expect(isUserRole(null)).toBe(false);
    });
  });

  describe('isMessageRole', () => {
    it('accepts known message roles', () => {
      expect(isMessageRole('user')).toBe(true);
      expect(isMessageRole('assistant')).toBe(true);
    });

    it('rejects unknown values', () => {
      expect(isMessageRole('system')).toBe(false);
      expect(isMessageRole(undefined)).toBe(false);
    });
  });
});
