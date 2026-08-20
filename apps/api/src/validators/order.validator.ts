import { z } from 'zod';

const addressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  county: z.string().optional(),
  postcode: z.string().min(1),
  country: z.string().default('GB'),
});

const orderItemSchema = z.object({
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

export const createOrderSchema = z
  .object({
    fromCart: z.boolean().optional(),
    customer: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      company: z.string().optional(),
    }),
    billingAddress: addressSchema.optional(),
    shippingAddress: addressSchema.optional(),
    items: z.array(orderItemSchema).optional(),
    customerNotes: z.string().optional(),
    paymentMethod: z.enum(['online', 'invoice']).optional(),
  })
  .refine((data) => data.fromCart || (data.items && data.items.length > 0), {
    message: 'Items are required when not ordering from cart',
  });

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    'pending',
    'confirmed',
    'artwork_review',
    'production',
    'dispatched',
    'completed',
    'cancelled',
  ]),
  adminNotes: z.string().optional(),
});
