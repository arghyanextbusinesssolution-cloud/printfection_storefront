import { Router } from 'express';
import * as quoteController from '../controllers/quote.controller';
import { validate } from '../middleware/validate';
import { createQuoteSchema, updateQuoteStatusSchema } from '../validators/quote.validator';
import { sessionMiddleware } from '../middleware/session';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.post('/', sessionMiddleware, validate(createQuoteSchema), quoteController.createQuote);
router.get('/', authenticate, requireAdmin, quoteController.listQuotes);
router.get('/:id', authenticate, requireAdmin, quoteController.getQuote);
router.patch('/:id/status', authenticate, requireAdmin, validate(updateQuoteStatusSchema), quoteController.updateQuoteStatus);
router.post('/:id/convert', authenticate, requireAdmin, quoteController.convertQuoteToOrder);

export default router;
