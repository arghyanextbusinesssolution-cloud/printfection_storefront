import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  externalId: z.string().optional(),
  brand: z.string().optional(),
  brandName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  garmentCategory: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  images: z.array(z.string()).optional(),
  material: z.string().optional(),
  fabric: z.string().optional(),
  weight: z.string().optional(),
  gender: z.string().optional(),
  organic: z.boolean().optional(),
  accreditations: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  plusSizeAvailable: z.boolean().optional(),
  ageGroup: z.string().optional(),
  basePrice: z.number().min(0),
  currency: z.string().optional(),
  minimumOrderQuantity: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createVariantSchema = z.object({
  sku: z.string().min(1),
  externalVariantId: z.string().optional(),
  colourName: z.string().min(1),
  colourHex: z.string().optional(),
  colourImage: z.string().optional(),
  size: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0).optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  category: z.string().optional(),
  garmentCategory: z.string().optional(),
  brand: z.string().optional(),
  gender: z.string().optional(),
  organic: z.coerce.boolean().optional(),
  fabric: z.string().optional(),
  weight: z.string().optional(),
  accreditations: z.string().optional(),
  tags: z.string().optional(),
  plusSizeAvailable: z.coerce.boolean().optional(),
  ageGroup: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createGarmentCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  iconSvg: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const updateGarmentCategorySchema = createGarmentCategorySchema.partial();

export const bulkOrderValidateSchema = z.object({
  productId: z.string().min(1),
  colourName: z.string().min(1),
  variants: z.array(
    z.object({
      variantId: z.string().min(1),
      size: z.string().min(1),
      quantity: z.number().min(0),
    })
  ),
});
