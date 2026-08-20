import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { ApiError } from '../utils/ApiError';

export const getPaymentConfig = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, {
    stripeEnabled: paymentService.isStripeConfigured(),
    publishableKey: paymentService.getStripePublishableKey(),
  });
});

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const orderId = paramId(req.params.orderId);
  const session = await paymentService.createCheckoutSession(orderId, req.sessionId!);
  sendSuccess(res, session);
});

export const verifySession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) throw ApiError.badRequest('session_id is required');
  const result = await paymentService.verifyCheckoutSession(sessionId);
  sendSuccess(res, result);
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || typeof signature !== 'string') {
    throw ApiError.badRequest('Missing stripe-signature header');
  }
  await paymentService.handleStripeWebhook(req.body as Buffer, signature);
  res.status(200).json({ received: true });
});
