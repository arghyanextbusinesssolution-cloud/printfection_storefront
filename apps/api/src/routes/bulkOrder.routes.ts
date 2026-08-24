import { Router } from 'express';
import * as bulkOrderController from '../controllers/bulkOrder.controller';
import { validate } from '../middleware/validate';
import { bulkOrderValidateSchema } from '../validators/product.validator';
import { uploadImage } from '../middleware/upload';

const router = Router();

router.get('/config/:productId', bulkOrderController.getBulkOrderConfig);
router.get('/sizes/:productId/:colourName', bulkOrderController.getSizesForColour);
router.post('/validate', validate(bulkOrderValidateSchema), bulkOrderController.validateBulkOrder);
router.post('/upload-artwork', uploadImage.single('artwork'), bulkOrderController.uploadArtwork);

export default router;
