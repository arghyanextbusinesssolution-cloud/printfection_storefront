import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  colourName: z.string().min(1),
  colourHex: z.string().optional(),
  variants: z.array(
    z.object({
      variantId: z.string().min(1),
      size: z.string().min(1),
      quantity: z.number().min(1),
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
  designId: z.string().optional(),
});

export const removeFromCartSchema = z.object({
  itemIndex: z.number().min(0),
});
