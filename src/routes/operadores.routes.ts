import { Router } from "express";
import {
  createOperadorController,
  deleteOperadorController,
  getOperadorController,
  listOperadoresController,
  updateOperadorController,
} from "../controllers/operadores.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Solo admin puede acceder a operadores
router.use(authenticate);
router.use(requireRole(["ADMIN"]));

router.get("/", listOperadoresController);
router.get("/:id", getOperadorController);
router.post("/", createOperadorController);
router.put("/:id", updateOperadorController);
router.delete("/:id", deleteOperadorController);

export default router;
