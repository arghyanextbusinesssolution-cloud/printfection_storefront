import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { sendSuccess } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { paramId } from '../utils/params';
import { authenticate, requireAdmin } from '../middleware/authenticate';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = req.body.fromCart
    ? await orderService.createOrderFromCart({
        sessionId: req.sessionId!,
        customer: req.body.customer,
        billingAddress: req.body.billingAddress,
        shippingAddress: req.body.shippingAddress,
        customerNotes: req.body.customerNotes,
        paymentMethod: req.body.paymentMethod,
      })
    : await orderService.createOrderFromItems(req.body);

  sendSuccess(res, order, 'Order created', 201);
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listOrders(req.query as { page?: number; limit?: number; status?: string });
  sendSuccess(res, result);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(paramId(req.params.id));
  sendSuccess(res, order);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(
    paramId(req.params.id),
    req.body.orderStatus,
    req.body.adminNotes
  );
  sendSuccess(res, order, 'Order status updated');
});

// Admin-only wrappers
export const adminListOrders = [authenticate, requireAdmin, listOrders];
export const adminGetOrder = [authenticate, requireAdmin, getOrder];
export const adminUpdateOrderStatus = [authenticate, requireAdmin, updateOrderStatus];
