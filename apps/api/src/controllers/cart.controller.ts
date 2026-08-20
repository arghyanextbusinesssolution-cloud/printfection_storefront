import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { calculatePricing } from '../services/pricing.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { ApiError } from '../utils/ApiError';

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.sessionId!);
  const totals = cartService.getCartTotals(cart);
  sendSuccess(res, { cart, totals });
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, productName, colourName, colourHex, variants, printLocations, designId } = req.body;

  const cart = await cartService.addToCart(req.sessionId!, {
    productId,
    productName,
    colourName,
    colourHex,
    variants,
    printLocations,
    designId,
    pricingInput: { productId, variants, printLocations },
  });

  sendSuccess(res, cart, 'Item added to cart', 201);
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const itemIndex = parseInt(paramId(req.params.index), 10);
  if (isNaN(itemIndex)) throw ApiError.badRequest('Invalid item index');
  const cart = await cartService.removeFromCart(req.sessionId!, itemIndex);
  sendSuccess(res, cart, 'Item removed');
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.clearCart(req.sessionId!);
  sendSuccess(res, cart, 'Cart cleared');
});

export const recalculateCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await cartService.getCart(req.sessionId!);
  for (const item of cart.items) {
    if (item.variants?.length) {
      item.pricingSnapshot = await calculatePricing({
        productId: item.productId,
        variants: item.variants,
        printLocations: item.printLocations,
      });
    }
  }
  await cart.save();
  sendSuccess(res, { cart, totals: cartService.getCartTotals(cart) });
});
