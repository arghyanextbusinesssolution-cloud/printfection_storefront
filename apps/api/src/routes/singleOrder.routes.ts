import { Router } from 'express';
import * as singleOrderController from '../controllers/singleOrder.controller';
import { sessionMiddleware } from '../middleware/session';

const router = Router();

router.use(sessionMiddleware);

router.get('/variants/:productId', singleOrderController.getVariants);
router.post('/add-to-cart', singleOrderController.addToCart);

export default router;
