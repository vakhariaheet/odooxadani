/**
 * Utility functions tests
 * Example of testing pure functions
 */

describe('Utility Functions', () => {
  describe('String utilities', () => {
    it('should format email addresses correctly', () => {
      const email = 'test@example.com';
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should validate UUIDs', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });
  });

  describe('Array utilities', () => {
    it('should handle empty arrays', () => {
      const arr: string[] = [];
      expect(arr.length).toBe(0);
      expect(Array.isArray(arr)).toBe(true);
    });

    it('should filter unique values', () => {
      const arr = [1, 2, 2, 3, 3, 3, 4];
      const unique = [...new Set(arr)];
      expect(unique).toEqual([1, 2, 3, 4]);
    });
  });

  describe('Object utilities', () => {
    it('should deep clone objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = JSON.parse(JSON.stringify(original));
      
      cloned.b.c = 3;
      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    it('should merge objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const merged = { ...obj1, ...obj2 };
      
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });
    });
  });
});
