import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  sendSuccess(res, stats);
});

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, {
    emailConfigured: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD),
    stripeConfigured: !!env.STRIPE_SECRET_KEY,
    designProvider: env.DESIGN_PROVIDER || 'placeholder',
    designConfigured: !!(env.DESIGN_PROVIDER && env.DESIGN_PROVIDER_LICENSE_KEY),
    productApiConfigured: !!(env.PRODUCT_API_BASE_URL && env.PRODUCT_API_KEY),
    environment: env.NODE_ENV,
  });
});