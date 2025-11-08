import { NextFunction, Request, Response } from 'express';
import {
  Canal,
  CreateCitaDTO,
  createCita,
  getCitaById,
  getCitas,
} from '../services/citas.service';

const allowedCanales: Canal[] = ['API', 'SMS', 'WEB'];

const buildCreateDto = (body: Request['body']): CreateCitaDTO => {
  const { id_paciente, id_medico, fecha, hora, canal, estado } = body;

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

  return {
    id_paciente: parsedPaciente,
    id_medico: parsedMedico,
    fecha,
    hora,
    canal: canal as Canal,
    estado,
  };
};

export const createCitaController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dto = buildCreateDto(req.body);
    const nuevaCita = await createCita(dto);
    res.status(201).json(nuevaCita);
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
