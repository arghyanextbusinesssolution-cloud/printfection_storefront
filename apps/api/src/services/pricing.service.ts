import { calculateTotalQuantity } from '@printfection/shared';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { PricingTier } from '../models/PricingTier';
import { PrintLocation } from '../models/PrintLocation';
import { PrintPricingRule } from '../models/PrintPricingRule';
import { ApiError } from '../utils/ApiError';
import { VAT_RATE } from '@printfection/config';
import type { PricingBreakdown, PricingCalculateInput, PricingLineItem } from '@printfection/types';

export async function validateBulkOrder(
  productId: string,
  colourName: string,
  variants: { variantId: string; size: string; quantity: number }[]
): Promise<{ valid: boolean; totalQuantity: number; minimumOrderQuantity: number; errors: string[] }> {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return { valid: false, totalQuantity: 0, minimumOrderQuantity: 0, errors: ['Product not found or inactive'] };
  }

  const errors: string[] = [];
  const totalQuantity = calculateTotalQuantity(variants);

  if (totalQuantity === 0) {
    errors.push('At least one item must have a quantity greater than zero');
  }

  if (totalQuantity > 0 && totalQuantity < product.minimumOrderQuantity) {
    errors.push(
      `Minimum order quantity is ${product.minimumOrderQuantity}. Current total: ${totalQuantity}`
    );
  }

  for (const item of variants.filter((v) => v.quantity > 0)) {
    const variant = await ProductVariant.findById(item.variantId);
    if (!variant || !variant.isActive) {
      errors.push(`Variant ${item.size} not found or inactive`);
      continue;
    }
    if (variant.colourName !== colourName) {
      errors.push(`Variant ${item.size} does not match selected colour ${colourName}`);
    }
    if (variant.stock < item.quantity) {
      errors.push(`Insufficient stock for size ${item.size}. Available: ${variant.stock}`);
    }
  }

  return {
    valid: errors.length === 0,
    totalQuantity,
    minimumOrderQuantity: product.minimumOrderQuantity,
    errors,
  };
}

async function findApplicableTier(totalQuantity: number) {
  return PricingTier.findOne({
    isActive: true,
    minQuantity: { $lte: totalQuantity },
    $or: [{ maxQuantity: { $gte: totalQuantity } }, { maxQuantity: null }],
  }).sort({ minQuantity: -1 });
}

export async function calculatePricing(input: PricingCalculateInput): Promise<PricingBreakdown> {
  const product = await Product.findById(input.productId);
  if (!product) throw ApiError.notFound('Product not found');

  const activeVariants = input.variants.filter((v) => v.quantity > 0);
  const totalQuantity = calculateTotalQuantity(activeVariants);

  if (totalQuantity === 0) {
    throw ApiError.badRequest('Total quantity must be greater than zero');
  }

  if (totalQuantity < product.minimumOrderQuantity) {
    throw ApiError.badRequest(
      `Minimum order quantity is ${product.minimumOrderQuantity}`
    );
  }

  const tier = await findApplicableTier(totalQuantity);
  const discountPercent = tier?.discountPercent ?? 0;

  const lineItems: PricingLineItem[] = [];
  let garmentSubtotal = 0;

  for (const item of activeVariants) {
    const variant = await ProductVariant.findById(item.variantId);
    if (!variant) throw ApiError.badRequest(`Invalid variant: ${item.variantId}`);

    const unitPrice = variant.price;
    const lineTotal = unitPrice * item.quantity;
    garmentSubtotal += lineTotal;

    lineItems.push({
      description: `${product.name} - ${variant.colourName} / ${variant.size}`,
      quantity: item.quantity,
      unitPrice,
      total: lineTotal,
    });
  }

  const discount = garmentSubtotal * (discountPercent / 100);
  let printingSubtotal = 0;
  let setupCharges = 0;

  if (input.printLocations?.length) {
    for (const pl of input.printLocations) {
      // Support both code strings (e.g. "FULL_BACK") and legacy ObjectIds
      const location = await PrintLocation.findOne({ code: pl.locationId })
        || await PrintLocation.findById(pl.locationId).catch(() => null);
      if (!location || !location.isActive) {
        throw ApiError.badRequest(`Invalid print location: ${pl.locationId}`);
      }
      if (pl.colourCount > location.maximumColours) {
        throw ApiError.badRequest(
          `Maximum ${location.maximumColours} colours allowed for ${location.name}`
        );
      }

      const rule = await PrintPricingRule.findOne({
        printLocation: location._id,
        colourCount: pl.colourCount,
        isActive: true,
        minQuantity: { $lte: totalQuantity },
        $or: [{ maxQuantity: { $gte: totalQuantity } }, { maxQuantity: null }],
      }).sort({ minQuantity: -1 });

      if (rule) {
        const printCost = rule.pricePerUnit * totalQuantity;
        printingSubtotal += printCost;
        setupCharges += rule.setupCharge;
        lineItems.push({
          description: `Printing - ${location.name} (${pl.colourCount} colour${pl.colourCount > 1 ? 's' : ''})`,
          quantity: totalQuantity,
          unitPrice: rule.pricePerUnit,
          total: printCost,
        });
      }
    }
  }

  const subtotal = garmentSubtotal - discount + printingSubtotal + setupCharges;
  const tax = subtotal * VAT_RATE;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return {
    garmentSubtotal,
    printingSubtotal,
    setupCharges,
    discount,
    subtotal,
    tax,
    shipping,
    total,
    currency: product.currency,
    lineItems,
  };
}
