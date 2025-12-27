import { Router } from "express";
import {
  createEspecialidadController,
  deleteEspecialidadController,
  getEspecialidadController,
  listEspecialidadesController,
  updateEspecialidadController,
} from "../controllers/especialidades.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// GET endpoints sin autenticación
router.get("/", listEspecialidadesController);
router.get("/:id", getEspecialidadController);

// El resto de endpoints requiere autenticación y rol ADMIN
router.use(authenticate);

router.post("/", requireRole(["ADMIN"]), createEspecialidadController);
router.put("/:id", requireRole(["ADMIN"]), updateEspecialidadController);
router.delete("/:id", requireRole(["ADMIN"]), deleteEspecialidadController);

export default router;
