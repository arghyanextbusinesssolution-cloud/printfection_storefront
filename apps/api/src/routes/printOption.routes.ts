import { Router } from 'express';
import * as pricingController from '../controllers/pricing.controller';

const router = Router();

router.get('/', pricingController.listPrintLocations);

export default router;
