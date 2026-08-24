import { Router } from 'express';
import * as garmentCategoryController from '../controllers/garmentCategory.controller';
import { validate } from '../middleware/validate';
import { createGarmentCategorySchema, updateGarmentCategorySchema } from '../validators/product.validator';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.get('/', garmentCategoryController.listGarmentCategories);
router.get('/:id', garmentCategoryController.getGarmentCategory);
router.post('/', authenticate, requireAdmin, validate(createGarmentCategorySchema), garmentCategoryController.createGarmentCategory);
router.put('/:id', authenticate, requireAdmin, validate(updateGarmentCategorySchema), garmentCategoryController.updateGarmentCategory);
router.delete('/:id', authenticate, requireAdmin, garmentCategoryController.deleteGarmentCategory);

export default router;
