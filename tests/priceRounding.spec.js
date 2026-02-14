/**
 * Unit tests for price rounding (ceil to step).
 */
import { describe, it, expect } from 'vitest';
import { applyPriceRoundingCeil } from '../src/utils/priceRounding';

describe('applyPriceRoundingCeil', () => {
  describe('step 50', () => {
    it('13200 → 13200 (already multiple)', () => {
      expect(applyPriceRoundingCeil(13200, 50)).toBe(13200);
    });
    it('13201 → 13250', () => {
      expect(applyPriceRoundingCeil(13201, 50)).toBe(13250);
    });
    it('13251 → 13300', () => {
      expect(applyPriceRoundingCeil(13251, 50)).toBe(13300);
    });
  });

  describe('step 100', () => {
    it('13201 → 13300', () => {
      expect(applyPriceRoundingCeil(13201, 100)).toBe(13300);
    });
    it('13200 → 13200', () => {
      expect(applyPriceRoundingCeil(13200, 100)).toBe(13200);
    });
    it('13299 → 13300', () => {
      expect(applyPriceRoundingCeil(13299, 100)).toBe(13300);
    });
  });

  describe('step 10', () => {
    it('13201 → 13210', () => {
      expect(applyPriceRoundingCeil(13201, 10)).toBe(13210);
    });
    it('13200 → 13200', () => {
      expect(applyPriceRoundingCeil(13200, 10)).toBe(13200);
    });
  });

  describe('step 500', () => {
    it('13201 → 13500', () => {
      expect(applyPriceRoundingCeil(13201, 500)).toBe(13500);
    });
    it('13000 → 13000', () => {
      expect(applyPriceRoundingCeil(13000, 500)).toBe(13000);
    });
  });

  describe('no rounding (step 0)', () => {
    it('13201 with step 0 → 13201', () => {
      expect(applyPriceRoundingCeil(13201, 0)).toBe(13201);
    });
    it('raw value unchanged', () => {
      expect(applyPriceRoundingCeil(9999.99, 0)).toBe(9999.99);
    });
  });

  describe('edge cases', () => {
    it('zero raw → 0', () => {
      expect(applyPriceRoundingCeil(0, 50)).toBe(0);
    });
    it('negative raw → 0', () => {
      expect(applyPriceRoundingCeil(-100, 50)).toBe(0);
    });
    it('NaN → 0', () => {
      expect(applyPriceRoundingCeil(NaN, 50)).toBe(0);
    });
  });
});
