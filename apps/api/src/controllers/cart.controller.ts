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
  const {
    productId,
    productName,
    colourName,
    colourHex,
    variants,
    printLocations,
    designId,
    isBulkOrder,
    colours,
    artworks,
  } = req.body;

  // Flatten variants from all colours to calculate correct unified pricing
  let flatVariants = variants;
  if (isBulkOrder && colours) {
    flatVariants = colours.flatMap((c: any) => c.variants);
  }

  const cart = await cartService.addToCart(req.sessionId!, {
    productId,
    productName,
    colourName,
    colourHex,
    variants: flatVariants,
    printLocations,
    designId,
    isBulkOrder,
    colours,
    artworks,
    pricingInput: { productId, variants: flatVariants, printLocations },
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
    let flatVariants = item.variants;
    if (item.isBulkOrder && item.colours) {
      flatVariants = (item.colours as any).flatMap((c: any) => c.variants);
    }
    if (flatVariants?.length) {
      item.pricingSnapshot = await calculatePricing({
        productId: item.productId,
        variants: flatVariants,
        printLocations: item.printLocations,
      });
    }
  }
  await cart.save();
  sendSuccess(res, { cart, totals: cartService.getCartTotals(cart) });
});

export const updateItemArtworks = asyncHandler(async (req: Request, res: Response) => {
  const itemIndex = parseInt(paramId(req.params.index), 10);
  if (isNaN(itemIndex)) throw ApiError.badRequest('Invalid item index');
  
  const { artworks } = req.body;
  const cart = await cartService.updateItemArtworks(req.sessionId!, itemIndex, artworks);
  sendSuccess(res, cart, 'Artworks updated');
});
