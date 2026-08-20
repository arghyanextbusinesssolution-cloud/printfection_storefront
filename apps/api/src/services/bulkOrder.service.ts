import { validateBulkOrder } from './pricing.service';
import { getProductById, getProductColours, getProductSizesForColour } from './product.service';
import { ApiError } from '../utils/ApiError';

export async function validateAndSummarizeBulkOrder(input: {
  productId: string;
  colourName: string;
  variants: { variantId: string; size: string; quantity: number }[];
}) {
  const validation = await validateBulkOrder(input.productId, input.colourName, input.variants);
  const product = await getProductById(input.productId);

  return {
    ...validation,
    product: {
      id: product._id,
      name: product.name,
      minimumOrderQuantity: product.minimumOrderQuantity,
      currency: product.currency,
    },
  };
}

export async function getBulkOrderConfig(productId: string) {
  const product = await getProductById(productId);
  const colours = await getProductColours(productId);

  return {
    product: {
      id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      minimumOrderQuantity: product.minimumOrderQuantity,
      basePrice: product.basePrice,
      currency: product.currency,
    },
    colours,
  };
}

export async function getSizesForColour(productId: string, colourName: string) {
  const product = await getProductById(productId);
  const variants = await getProductSizesForColour(productId, colourName);

  if (variants.length === 0) {
    throw ApiError.notFound(`No variants found for colour: ${colourName}`);
  }

  return {
    productId: product._id,
    colourName,
    minimumOrderQuantity: product.minimumOrderQuantity,
    sizes: variants.map((v) => ({
      variantId: v._id,
      size: v.size,
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    })),
  };
}
