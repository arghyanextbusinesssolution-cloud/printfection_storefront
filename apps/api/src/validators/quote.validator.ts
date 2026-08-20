import { z } from 'zod';

const quoteItemSchema = z.object({
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

export const createQuoteSchema = z
  .object({
    fromCart: z.boolean().optional(),
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
    }),
    items: z.array(quoteItemSchema).optional(),
    customerNotes: z.string().optional(),
  })
  .refine((data) => data.fromCart || (data.items && data.items.length > 0), {
    message: 'Items are required when not submitting from cart',
  });

export const updateQuoteStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'sent', 'accepted', 'rejected', 'expired', 'converted']),
  adminNotes: z.string().optional(),
});
