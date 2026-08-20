import { Request, Response } from 'express';
import * as pricingService from '../services/pricing.service';
import { PricingTier } from '../models/PricingTier';
import { PrintLocation } from '../models/PrintLocation';
import { PrintPricingRule } from '../models/PrintPricingRule';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { paramId } from '../utils/params';

export const calculatePricing = asyncHandler(async (req: Request, res: Response) => {
  const breakdown = await pricingService.calculatePricing(req.body);
  sendSuccess(res, breakdown);
});

export const listPricingTiers = asyncHandler(async (_req: Request, res: Response) => {
  const tiers = await PricingTier.find().sort({ sortOrder: 1, minQuantity: 1 });
  sendSuccess(res, tiers);
});

export const createPricingTier = asyncHandler(async (req: Request, res: Response) => {
  const tier = await PricingTier.create(req.body);
  sendSuccess(res, tier, 'Pricing tier created', 201);
});

export const updatePricingTier = asyncHandler(async (req: Request, res: Response) => {
  const tier = await PricingTier.findByIdAndUpdate(paramId(req.params.id), req.body, { new: true });
  if (!tier) throw ApiError.notFound('Pricing tier not found');
  sendSuccess(res, tier, 'Pricing tier updated');
});

export const listPrintLocations = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.activeOnly !== 'false' ? { isActive: true } : {};
  const locations = await PrintLocation.find(filter).sort({ sortOrder: 1 });
  sendSuccess(res, locations);
});

export const createPrintLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await PrintLocation.create(req.body);
  sendSuccess(res, location, 'Print location created', 201);
});

export const updatePrintLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await PrintLocation.findByIdAndUpdate(paramId(req.params.id), req.body, { new: true });
  if (!location) throw ApiError.notFound('Print location not found');
  sendSuccess(res, location, 'Print location updated');
});

export const listPrintPricingRules = asyncHandler(async (_req: Request, res: Response) => {
  const rules = await PrintPricingRule.find().populate('printLocation', 'name code');
  sendSuccess(res, rules);
});

export const createPrintPricingRule = asyncHandler(async (req: Request, res: Response) => {
  const rule = await PrintPricingRule.create(req.body);
  sendSuccess(res, rule, 'Print pricing rule created', 201);
});
