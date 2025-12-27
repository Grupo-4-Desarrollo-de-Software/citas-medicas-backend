import { Router } from "express";
import {
  createCitaController,
  getCitaByIdController,
  getCitasController,
  confirmCitaController,
  cancelCitaController,
  createCitaBySmsController,
} from "../controllers/citas.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /citas:
 *   post:
 *     summary: Crear una nueva cita
 *     description: Crea una nueva cita médica que puede ser registrada por SMS, API o WEB
 *     tags:
 *       - Citas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_paciente, id_especialidad, id_sede, fecha, hora, canal]
 *             properties:
 *               id_paciente:
 *                 type: number
 *                 description: ID del paciente
 *               id_especialidad:
 *                 type: number
 *                 description: ID de la especialidad médica
 *               id_sede:
 *                 type: number
 *                 description: ID de la sede médica
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la cita (YYYY-MM-DD)
 *               hora:
 *                 type: string
 *                 format: time
 *                 description: Hora de la cita (HH:MM:SS)
 *               canal:
 *                 type: string
 *                 enum: [API, SMS, WEB]
 *                 description: Canal por el cual se registra la cita
 *               estado:
 *                 type: string
 *                 default: PENDIENTE
 *                 description: Estado inicial de la cita
 *               telefono:
 *                 type: string
 *                 description: Teléfono para enviar SMS de confirmación
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Datos incompletos o inválidos
 *       409:
 *         description: Conflicto de horario en la especialidad/sede
 *   get:
 *     summary: Obtener todas las citas
 *     tags:
 *       - Citas
 *     responses:
 *       200:
 *         description: Lista de citas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cita'
 */
router.post("/", createCitaController);
router.get("/", getCitasController);

/**
 * @swagger
 * /citas/sms:
 *   post:
 *     summary: Crear cita vía SMS
 *     description: Crea una cita médica registrada por SMS, creando paciente automáticamente si no existe
 *     tags:
 *       - Citas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [telefono, id_especialidad, id_sede, fecha, hora]
 *             properties:
 *               telefono:
 *                 type: string
 *                 description: Teléfono del paciente (se crea automáticamente si no existe)
 *               id_especialidad:
 *                 type: number
 *                 description: ID de la especialidad médica
 *               id_sede:
 *                 type: number
 *                 description: ID de la sede médica
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la cita (YYYY-MM-DD)
 *               hora:
 *                 type: string
 *                 format: time
 *                 description: Hora de la cita (HH:MM:SS)
 *     responses:
 *       201:
 *         description: Cita SMS creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cita'
 *       400:
 *         description: Datos incompletos o inválidos
 *       409:
 *         description: Conflicto de horario en la especialidad/sede
 */
router.post("/sms", createCitaBySmsController);

/**
 * @swagger
 * /citas/{id}:
 *   get:
 *     summary: Obtener una cita por ID
 *     tags:
 *       - Citas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Detalle de la cita
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cita'
 *       404:
 *         description: Cita no encontrada
 */
router.get("/:id", getCitaByIdController);

/**
 * @swagger
 * /citas/confirmar:
 *   post:
 *     summary: Confirmar una cita
 *     tags:
 *       - Citas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_cita]
 *             properties:
 *               id_cita:
 *                 type: number
 *                 description: ID de la cita a confirmar
 *               telefono:
 *                 type: string
 *                 description: Teléfono para enviar SMS de confirmación
 *     responses:
 *       200:
 *         description: Cita confirmada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cita'
 *       404:
 *         description: Cita no encontrada
 */
router.post("/confirmar", authenticate, confirmCitaController);

/**
 * @swagger
 * /citas/cancelar:
 *   post:
 *     summary: Cancelar una cita
 *     tags:
 *       - Citas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_cita]
 *             properties:
 *               id_cita:
 *                 type: number
 *                 description: ID de la cita a cancelar
 *     responses:
 *       200:
 *         description: Cita cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cita'
 *       404:
 *         description: Cita no encontrada
 */
router.post("/cancelar", authenticate, cancelCitaController);

export default router;
