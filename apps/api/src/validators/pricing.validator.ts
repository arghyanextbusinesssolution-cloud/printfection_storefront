import { z } from 'zod';

export const pricingCalculateSchema = z.object({
  productId: z.string().min(1),
  variants: z.array(
    z.object({
      variantId: z.string().min(1),
      size: z.string().min(1),
      quantity: z.number().min(0),
    })
  ),
  printLocations: z
    .array(
      z.object({
        locationId: z.string().min(1),
        colourCount: z.number().min(1),
      })
    )
    .optional(),
});

export const createPricingTierSchema = z.object({
  name: z.string().min(1),
  minQuantity: z.number().min(1),
  maxQuantity: z.number().min(1).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const createPrintLocationSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  image: z.string().optional(),
  icon: z.string().optional(),
  maximumColours: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export const createPrintPricingRuleSchema = z.object({
  printLocation: z.string().min(1),
  colourCount: z.number().min(1),
  minQuantity: z.number().min(1),
  maxQuantity: z.number().min(1).optional(),
  pricePerUnit: z.number().min(0),
  setupCharge: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});
