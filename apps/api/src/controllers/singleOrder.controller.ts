import { Request, Response } from 'express';
import * as singleOrderService from '../services/singleOrder.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';

export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  const variants = await singleOrderService.getVariantsByProduct(paramId(req.params.productId));
  sendSuccess(res, variants);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, productName, variantId, colourName, colourHex, size, quantity, notes } = req.body;
  const cart = await singleOrderService.addSinglePieceToCart(req.sessionId!, {
    productId,
    productName,
    variantId,
    colourName,
    colourHex,
    size,
    quantity,
    notes,
  });
  sendSuccess(res, cart, 'Custom item added to cart', 201);
});
