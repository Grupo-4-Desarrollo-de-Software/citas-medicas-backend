import { NextFunction, Request, Response } from 'express';
import {
  Canal,
  CreateCitaDTO,
  createCita,
  getCitaById,
  getCitas,
  confirmCita,
} from '../services/citas.service';

const allowedCanales: Canal[] = ['API', 'SMS', 'WEB'];

const buildCreateDto = (body: Request['body']): CreateCitaDTO => {
  const { id_paciente, id_medico, fecha, hora, canal, estado } = body;
  const telefono = body.telefono;

  const parsedPaciente = Number(id_paciente);
  const parsedMedico = Number(id_medico);

  if (
    !Number.isFinite(parsedPaciente) ||
    !Number.isFinite(parsedMedico) ||
    typeof fecha !== 'string' ||
    typeof hora !== 'string' ||
    typeof canal !== 'string'
  ) {
    throw new Error('VALIDATION_ERROR');
  }

  if (!allowedCanales.includes(canal as Canal)) {
    throw new Error('INVALID_CANAL');
  }

  if (estado && typeof estado !== 'string') {
    throw new Error('VALIDATION_ERROR');
  }

  if (telefono && typeof telefono !== 'string') {
    throw new Error('VALIDATION_ERROR');
  }

  return {
    id_paciente: parsedPaciente,
    id_medico: parsedMedico,
    fecha,
    hora,
    canal: canal as Canal,
    estado,
    telefono,
  };
};

export const createCitaController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = buildCreateDto(req.body);
    const idempotencyKey =
      (req.header('Idempotency-Key') || req.header('idempotency-key')) ?? undefined;

    const result = await createCita(dto, idempotencyKey);

    if (result.created) {
      return res.status(201).json(result.cita);
    }

    // If idempotent repeat, return the existing resource
    return res.status(200).json(result.cita);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'VALIDATION_ERROR') {
        return res
          .status(400)
          .json({ message: 'Datos incompletos o con tipo inválido' });
      }

      if (error.message === 'INVALID_CANAL') {
        return res
          .status(400)
          .json({ message: "El canal debe ser 'API', 'SMS' o 'WEB'" });
      }
      if (error.message === 'SCHEDULE_CONFLICT') {
        return res
          .status(409)
          .json({ message: 'Existe otra cita para ese médico en la misma fecha/hora' });
      }
    }

    next(error);
  }
};

export const getCitasController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const citas = await getCitas();
    res.json(citas);
  } catch (error) {
    next(error);
  }
};

export const getCitaByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'El id debe ser numérico' });
    }

    const cita = await getCitaById(id);

    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json(cita);
  } catch (error) {
    next(error);
  }
};

export const confirmCitaController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id_cita, id, telefono } = req.body as { id_cita?: number; id?: number; telefono?: string };
    const idNum = Number(id_cita ?? id);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: 'El id de la cita debe ser numérico' });
    }

    const updated = await confirmCita(idNum, telefono);
    return res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }
    }

    next(error);
  }
};
