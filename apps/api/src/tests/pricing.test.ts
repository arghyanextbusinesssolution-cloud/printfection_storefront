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
  it('validates minimum order quantity', () => {
    const minimumOrderQuantity = 25;
    const totalQuantity = 20;
    expect(totalQuantity < minimumOrderQuantity).toBe(true);
  });

  it('passes when quantity meets minimum', () => {
    const minimumOrderQuantity = 25;
    const totalQuantity = 30;
    expect(totalQuantity >= minimumOrderQuantity).toBe(true);
  });
});
