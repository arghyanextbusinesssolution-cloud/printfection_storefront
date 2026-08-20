import { Router } from 'express';
import * as pricingController from '../controllers/pricing.controller';
import { validate } from '../middleware/validate';
import {
  pricingCalculateSchema,
  createPricingTierSchema,
  createPrintLocationSchema,
  createPrintPricingRuleSchema,
} from '../validators/pricing.validator';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.post('/calculate', validate(pricingCalculateSchema), pricingController.calculatePricing);

router.get('/tiers', pricingController.listPricingTiers);
router.post('/tiers', authenticate, requireAdmin, validate(createPricingTierSchema), pricingController.createPricingTier);
router.put('/tiers/:id', authenticate, requireAdmin, pricingController.updatePricingTier);

router.get('/print-locations', pricingController.listPrintLocations);
router.post('/print-locations', authenticate, requireAdmin, validate(createPrintLocationSchema), pricingController.createPrintLocation);
router.put('/print-locations/:id', authenticate, requireAdmin, pricingController.updatePrintLocation);

router.get('/print-rules', pricingController.listPrintPricingRules);
router.post('/print-rules', authenticate, requireAdmin, validate(createPrintPricingRuleSchema), pricingController.createPrintPricingRule);

export default router;
