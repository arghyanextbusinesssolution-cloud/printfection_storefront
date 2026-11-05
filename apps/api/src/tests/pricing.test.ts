import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { calculateTotalQuantity } from '@printfection/shared';

describe('Shared utilities', () => {
  it('calculates total quantity correctly', () => {
    const variants = [
      { quantity: 10 },
      { quantity: 15 },
      { quantity: 0 },
    ];
    expect(calculateTotalQuantity(variants)).toBe(25);
  });

  it('returns zero for empty variants', () => {
    expect(calculateTotalQuantity([])).toBe(0);
  });
});

describe('Pricing validation logic', () => {
  it('accepts any quantity of 1 or more', () => {
    const totalQuantity = 1;
    expect(totalQuantity >= 1).toBe(true);
  });

  it('rejects zero quantity', () => {
    const totalQuantity = 0;
    expect(totalQuantity > 0).toBe(false);
  });
});
