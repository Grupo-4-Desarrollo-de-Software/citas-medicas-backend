import { Router } from "express";
import {
  createPacienteController,
  deletePacienteController,
  getPacienteController,
  listPacientesController,
  updatePacienteController,
} from "../controllers/pacientes.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Solo admin y operador pueden acceder a pacientes
router.use(authenticate);

router.get("/", listPacientesController);
router.get("/:id", getPacienteController);
router.post("/", requireRole(["ADMIN", "OPERADOR"]), createPacienteController);
router.put(
  "/:id",
  requireRole(["ADMIN", "OPERADOR"]),
  updatePacienteController
);
router.delete("/:id", requireRole(["ADMIN"]), deletePacienteController);

export default router;
