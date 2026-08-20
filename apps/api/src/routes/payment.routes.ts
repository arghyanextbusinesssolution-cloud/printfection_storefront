import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

router.get('/config', paymentController.getPaymentConfig);
router.post('/checkout/:orderId', paymentController.createCheckoutSession);
router.get('/verify', paymentController.verifySession);

export default router;
