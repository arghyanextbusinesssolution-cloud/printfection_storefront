import { Cart, ICart } from '../models/Cart';
import { calculatePricing } from './pricing.service';
import { ApiError } from '../utils/ApiError';
import type { CartItemConfig, PricingCalculateInput } from '@printfection/types';

export async function getOrCreateCart(sessionId: string): Promise<ICart> {
  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }
  return cart;
}

export async function getCart(sessionId: string): Promise<ICart> {
  const cart = await getOrCreateCart(sessionId);
  return cart;
}

export async function addToCart(
  sessionId: string,
  item: Omit<CartItemConfig, 'pricingSnapshot'> & { pricingInput?: PricingCalculateInput }
): Promise<ICart> {
  const cart = await getOrCreateCart(sessionId);

  let pricingSnapshot;
  if (item.pricingInput) {
    pricingSnapshot = await calculatePricing(item.pricingInput);
  }

  const cartItem: CartItemConfig = {
    productId: item.productId,
    productName: item.productName,
    colourName: item.colourName || '',
    colourHex: item.colourHex,
    variants: item.variants || [],
    printLocations: item.printLocations,
    designId: item.designId,
    pricingSnapshot,
    isBulkOrder: item.isBulkOrder || false,
    colours: item.colours,
    artworks: item.artworks,
  };

  cart.items.push(cartItem as any);
  await cart.save();
  return cart;
}

export async function removeFromCart(sessionId: string, itemIndex: number): Promise<ICart> {
  const cart = await getOrCreateCart(sessionId);
  if (itemIndex < 0 || itemIndex >= cart.items.length) {
    throw ApiError.notFound('Cart item not found');
  }
  cart.items.splice(itemIndex, 1);
  await cart.save();
  return cart;
}

export async function clearCart(sessionId: string): Promise<ICart> {
  const cart = await getOrCreateCart(sessionId);
  cart.items = [];
  await cart.save();
  return cart;
}

export async function updateItemArtworks(
  sessionId: string,
  itemIndex: number,
  artworks: any[]
): Promise<ICart> {
  const cart = await getOrCreateCart(sessionId);
  if (itemIndex < 0 || itemIndex >= cart.items.length) {
    throw ApiError.notFound('Cart item not found');
  }
  cart.items[itemIndex].artworks = artworks;
  cart.markModified('items');
  await cart.save();
  return cart;
}

export function getCartTotals(cart: ICart) {
  let subtotal = 0;
  let tax = 0;
  let total = 0;
  let currency = 'GBP';

  for (const item of cart.items) {
    if (item.pricingSnapshot) {
      subtotal += item.pricingSnapshot.subtotal ?? 0;
      tax += item.pricingSnapshot.tax ?? 0;
      total += item.pricingSnapshot.total ?? 0;
      currency = item.pricingSnapshot.currency ?? currency;
    }
  }

  return { subtotal, tax, total, currency, itemCount: cart.items.length };
}
