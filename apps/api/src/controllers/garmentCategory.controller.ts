import { Request, Response } from 'express';
import * as garmentCategoryService from '../services/garmentCategory.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';

export const listGarmentCategories = asyncHandler(async (req: Request, res: Response) => {
  const activeOnly = req.query.activeOnly !== 'false';
  const categories = await garmentCategoryService.listGarmentCategories(activeOnly);
  sendSuccess(res, categories);
});

export const getGarmentCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await garmentCategoryService.getGarmentCategoryById(paramId(req.params.id));
  sendSuccess(res, category);
});

export const createGarmentCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await garmentCategoryService.createGarmentCategory(req.body);
  sendSuccess(res, category, 'Garment Category created', 201);
});

export const updateGarmentCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await garmentCategoryService.updateGarmentCategory(paramId(req.params.id), req.body);
  sendSuccess(res, category, 'Garment Category updated');
});

export const deleteGarmentCategory = asyncHandler(async (req: Request, res: Response) => {
  await garmentCategoryService.deleteGarmentCategory(paramId(req.params.id));
  sendSuccess(res, null, 'Garment Category deactivated');
});
