import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboard);
router.get('/settings', authenticate, requireAdmin, adminController.getSettings);

export default router;
