import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { validate } from '../middleware/validate';
import { addToCartSchema } from '../validators/cart.validator';
import { sessionMiddleware } from '../middleware/session';

const router = Router();

router.use(sessionMiddleware);

router.get('/', cartController.getCart);
router.post('/items', validate(addToCartSchema), cartController.addToCart);
router.delete('/items/:index', cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.post('/recalculate', cartController.recalculateCart);

export default router;
