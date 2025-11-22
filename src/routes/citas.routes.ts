import { Router } from 'express';
import {
  createCitaController,
  getCitaByIdController,
  getCitasController,
  confirmCitaController,
} from '../controllers/citas.controller';

const router = Router();

router.post('/', createCitaController);
router.post('/confirmar', confirmCitaController);
router.get('/', getCitasController);
router.get('/:id', getCitaByIdController);

export default router;
