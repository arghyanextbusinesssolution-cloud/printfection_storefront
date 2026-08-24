import { Request, Response } from 'express';
import * as bulkOrderService from '../services/bulkOrder.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';

export const getBulkOrderConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await bulkOrderService.getBulkOrderConfig(paramId(req.params.productId));
  sendSuccess(res, config);
});

export const getSizesForColour = asyncHandler(async (req: Request, res: Response) => {
  const sizes = await bulkOrderService.getSizesForColour(
    paramId(req.params.productId),
    paramId(req.params.colourName)
  );
  sendSuccess(res, sizes);
});

export const validateBulkOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await bulkOrderService.validateAndSummarizeBulkOrder(req.body);
  sendSuccess(res, result);
});

export const uploadArtwork = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('No artwork file uploaded');
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  sendSuccess(res, {
    url: fileUrl,
    filename: req.file.originalname,
  }, 'Artwork uploaded successfully');
});
