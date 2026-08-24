import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  // Legacy single-colour fields (optional for unified bulk order)
  colourName: z.string().optional(),
  colourHex: z.string().optional(),
  variants: z
    .array(
      z.object({
        variantId: z.string().min(1),
        size: z.string().min(1),
        quantity: z.number().min(1),
      })
    )
    .optional(),
  printLocations: z
    .array(
      z.object({
        locationId: z.string().min(1),
        colourCount: z.number().min(1),
      })
    )
    .optional(),
  designId: z.string().optional(),
  // Unified bulk order structures
  isBulkOrder: z.boolean().optional(),
  colours: z
    .array(
      z.object({
        colourName: z.string().min(1),
        colourHex: z.string().optional(),
        colourImage: z.string().optional(),
        variants: z.array(
          z.object({
            variantId: z.string().min(1),
            size: z.string().min(1),
            quantity: z.number().min(0),
          })
        ),
      })
    )
    .optional(),
  artworks: z
    .array(
      z.object({
        colourName: z.string().optional(),
        locationId: z.string().optional(),
        url: z.string().min(1),
        filename: z.string().min(1),
      })
    )
    .optional(),
});

export const removeFromCartSchema = z.object({
  itemIndex: z.number().min(0),
});
