import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validate } from '../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';
import { sessionMiddleware } from '../middleware/session';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.post('/', sessionMiddleware, validate(createOrderSchema), orderController.createOrder);
router.get('/', authenticate, requireAdmin, orderController.listOrders);
router.get('/:id', authenticate, requireAdmin, orderController.getOrder);
router.patch('/:id/status', authenticate, requireAdmin, validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
