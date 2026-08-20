import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  productQuerySchema,
} from '../validators/product.validator';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.get('/filters', productController.getFilterOptions);
router.get('/', validate(productQuerySchema, 'query'), productController.listProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProduct);
router.get('/:productId/colours', productController.getProductColours);
router.get('/:productId/variants', productController.getVariants);

router.post('/', authenticate, requireAdmin, validate(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, requireAdmin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);
router.post('/:productId/variants', authenticate, requireAdmin, validate(createVariantSchema), productController.createVariant);
router.put('/variants/:variantId', authenticate, requireAdmin, productController.updateVariant);

export default router;
