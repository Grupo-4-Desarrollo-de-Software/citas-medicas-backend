import { Router } from 'express';
import { operationMetricsController } from '../controllers/metrics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/operacion', operationMetricsController);

export default router;
