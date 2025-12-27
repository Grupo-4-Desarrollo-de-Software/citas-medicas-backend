import { Router } from "express";
import {
  createSedeController,
  deleteSedeController,
  especialidadesBySedeController,
  getSedeController,
  linkEspecialidadController,
  listSedesController,
  unlinkEspecialidadController,
  updateSedeController,
} from "../controllers/sedes.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// GET endpoints sin autenticación
router.get("/", listSedesController);
router.get("/:id", getSedeController);
router.get("/:id_sede/especialidades", especialidadesBySedeController);

// El resto de endpoints requiere autenticación y rol ADMIN
router.use(authenticate);

router.post("/", requireRole(["ADMIN"]), createSedeController);
router.put("/:id", requireRole(["ADMIN"]), updateSedeController);
router.delete("/:id", requireRole(["ADMIN"]), deleteSedeController);
router.post(
  "/:id_sede/especialidades/:id_especialidad",
  requireRole(["ADMIN"]),
  linkEspecialidadController
);
router.delete(
  "/:id_sede/especialidades/:id_especialidad",
  requireRole(["ADMIN"]),
  unlinkEspecialidadController
);

export default router;
