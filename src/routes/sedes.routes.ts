import { Router } from 'express';
import {
  createSedeController,
  deleteSedeController,
  especialidadesBySedeController,
  getSedeController,
  linkEspecialidadController,
  listSedesController,
  unlinkEspecialidadController,
  updateSedeController,
} from '../controllers/sedes.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de gestión de sedes requieren autenticación
router.use(authenticate);

router.get('/', listSedesController);
router.get('/:id', getSedeController);
router.post('/', requireRole(['ADMIN']), createSedeController);
router.put('/:id', requireRole(['ADMIN']), updateSedeController);
router.delete('/:id', requireRole(['ADMIN']), deleteSedeController);

router.get('/:id_sede/especialidades', especialidadesBySedeController);
router.post(
  '/:id_sede/especialidades/:id_especialidad',
  requireRole(['ADMIN']),
  linkEspecialidadController,
);
router.delete(
  '/:id_sede/especialidades/:id_especialidad',
  requireRole(['ADMIN']),
  unlinkEspecialidadController,
);

export default router;
