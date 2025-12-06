import { Router } from 'express';
import {
  createEspecialidadController,
  deleteEspecialidadController,
  getEspecialidadController,
  listEspecialidadesController,
  updateEspecialidadController,
} from '../controllers/especialidades.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listEspecialidadesController);
router.get('/:id', getEspecialidadController);
router.post('/', requireRole(['ADMIN']), createEspecialidadController);
router.put('/:id', requireRole(['ADMIN']), updateEspecialidadController);
router.delete('/:id', requireRole(['ADMIN']), deleteEspecialidadController);

export default router;
