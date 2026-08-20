import { Router } from 'express';
import * as importController from '../controllers/import.controller';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { uploadCsv } from '../middleware/upload';

const router = Router();

router.get('/jobs', authenticate, requireAdmin, importController.listImportJobs);
router.post('/preview', authenticate, requireAdmin, uploadCsv.single('file'), importController.previewImport);
router.post('/csv', authenticate, requireAdmin, uploadCsv.single('file'), importController.importCsv);
router.post('/sync', authenticate, requireAdmin, importController.syncFromApi);

export default router;
