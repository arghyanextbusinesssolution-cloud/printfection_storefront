import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { addToCart as cartServiceAddToCart } from './cart.service';
import { ApiError } from '../utils/ApiError';
import { VAT_RATE } from '@printfection/config';
import type { ICart } from '../models/Cart';
import type { CartItemConfig, PricingBreakdown } from '@printfection/types';

export async function getVariantsByProduct(productId: string) {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  
  return ProductVariant.find({ product: productId, isActive: true }).sort({ colourName: 1, size: 1 });
}

export async function addSinglePieceToCart(
  sessionId: string,
  input: {
    productId: string;
    productName: string;
    variantId: string;
    colourName: string;
    colourHex?: string;
    size: string;
    quantity: number;
    notes?: string;
  }
): Promise<ICart> {
  const product = await Product.findById(input.productId);
  if (!product) throw ApiError.notFound('Product not found');

  const variant = await ProductVariant.findById(input.variantId);
  if (!variant || !variant.isActive) throw ApiError.notFound('Variant not found');

  if (variant.stock < input.quantity) {
    throw ApiError.badRequest(`Insufficient stock. Available: ${variant.stock}`);
  }

  // Calculate pricing specifically for 1 piece (no MOQ checks)
  const unitPrice = variant.price;
  const lineTotal = unitPrice * input.quantity;
  const subtotal = lineTotal; // No printing/discount setup rules for single custom order (printing calculated at checkout or flat)
  const tax = subtotal * VAT_RATE;
  const total = subtotal + tax;

  const pricingSnapshot: PricingBreakdown = {
    garmentSubtotal: lineTotal,
    printingSubtotal: 0,
    setupCharges: 0,
    discount: 0,
    subtotal,
    tax,
    shipping: 0,
    total,
    currency: product.currency || 'GBP',
    lineItems: [
      {
        description: `${product.name} (Single Piece Custom) - ${variant.colourName} / ${variant.size}`,
        quantity: input.quantity,
        unitPrice,
        total: lineTotal,
      }
    ],
  };

  const item: Omit<CartItemConfig, 'pricingSnapshot'> = {
    productId: input.productId,
    productName: input.productName,
    colourName: input.colourName,
    colourHex: input.colourHex,
    variants: [
      {
        variantId: input.variantId,
        size: input.size,
        quantity: input.quantity,
      }
    ],
    printLocations: [], // Empty print locations, print design is set via notes/custom file upload at checkout
    designId: undefined,
  };

  // Add to cart directly with our custom pricingSnapshot
  const { Cart } = require('../models/Cart');
  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }

  cart.items.push({
    ...item,
    pricingSnapshot,
    notes: input.notes, // Store artwork notes
  } as any);

  await cart.save();
  return cart;
}
