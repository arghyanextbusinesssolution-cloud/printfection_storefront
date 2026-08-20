import { Request, Response } from 'express';
import * as designService from '../services/designProvider.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';

export const getProviderInfo = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, designService.getProviderInfo());
});

export const createDesign = asyncHandler(async (req: Request, res: Response) => {
  const design = await designService.createDesign({
    productId: req.body.productId,
    sessionId: req.sessionId,
    configuration: req.body.configuration,
  });
  sendSuccess(res, design, 'Design created', 201);
});

export const getDesign = asyncHandler(async (req: Request, res: Response) => {
  const design = await designService.getDesign(paramId(req.params.id));
  sendSuccess(res, design);
});

export const saveDesign = asyncHandler(async (req: Request, res: Response) => {
  const design = await designService.saveDesign(paramId(req.params.id), req.body.configuration);
  sendSuccess(res, design, 'Design saved');
});

export const exportDesign = asyncHandler(async (req: Request, res: Response) => {
  const design = await designService.exportDesign(paramId(req.params.id));
  sendSuccess(res, design, 'Design exported');
});
