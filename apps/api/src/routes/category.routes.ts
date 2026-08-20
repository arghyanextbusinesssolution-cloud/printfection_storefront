import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../validators/product.validator';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', authenticate, requireAdmin, validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, requireAdmin, validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

export default router;
