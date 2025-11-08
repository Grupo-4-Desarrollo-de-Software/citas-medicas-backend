import { Router } from 'express';
import {
  createCitaController,
  getCitaByIdController,
  getCitasController,
} from '../controllers/citas.controller';

const router = Router();

router.post('/', createCitaController);
router.get('/', getCitasController);
router.get('/:id', getCitaByIdController);

export default router;
