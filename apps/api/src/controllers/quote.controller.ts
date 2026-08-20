import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';

export const createQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = req.body.fromCart
    ? await orderService.createQuoteFromCart({
        sessionId: req.sessionId!,
        customer: req.body.customer,
        customerNotes: req.body.customerNotes,
      })
    : await orderService.createQuote(req.body);

  sendSuccess(res, quote, 'Quote submitted', 201);
});

export const listQuotes = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listQuotes(req.query as { page?: number; limit?: number; status?: string });
  sendSuccess(res, result);
});

export const getQuote = asyncHandler(async (req: Request, res: Response) => {
  const quote = await orderService.getQuoteById(paramId(req.params.id));
  sendSuccess(res, quote);
});

export const updateQuoteStatus = asyncHandler(async (req: Request, res: Response) => {
  const quote = await orderService.updateQuoteStatus(
    paramId(req.params.id),
    req.body.status,
    req.body.adminNotes
  );
  sendSuccess(res, quote, 'Quote status updated');
});

export const convertQuoteToOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.convertQuoteToOrder(
    paramId(req.params.id),
    req.body.adminNotes
  );
  sendSuccess(res, order, 'Quote converted to order', 201);
});
