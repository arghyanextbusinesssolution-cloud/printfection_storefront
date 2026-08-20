import { Router } from 'express';
import * as designController from '../controllers/design.controller';
import { sessionMiddleware } from '../middleware/session';

const router = Router();

router.get('/provider', designController.getProviderInfo);
router.post('/', sessionMiddleware, designController.createDesign);
router.get('/:id', designController.getDesign);
router.put('/:id', sessionMiddleware, designController.saveDesign);
router.post('/:id/export', designController.exportDesign);

export default router;
