import { Router } from 'express';
import * as bulkOrderController from '../controllers/bulkOrder.controller';
import { validate } from '../middleware/validate';
import { bulkOrderValidateSchema } from '../validators/product.validator';

const router = Router();

router.get('/config/:productId', bulkOrderController.getBulkOrderConfig);
router.get('/sizes/:productId/:colourName', bulkOrderController.getSizesForColour);
router.post('/validate', validate(bulkOrderValidateSchema), bulkOrderController.validateBulkOrder);

export default router;
