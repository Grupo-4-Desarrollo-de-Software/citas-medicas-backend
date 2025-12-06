import { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import {
  createEspecialidad,
  deleteEspecialidad,
  getEspecialidadById,
  getEspecialidades,
  updateEspecialidad,
} from '../services/especialidades.service';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

export const listEspecialidadesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const especialidades = await getEspecialidades();
    res.json(especialidades);
  } catch (error) {
    next(error);
  }
};

export const getEspecialidadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'El id de la especialidad debe ser numérico' });
    }

    const especialidad = await getEspecialidadById(id);
    if (!especialidad) {
      return res.status(404).json({ message: 'Especialidad no encontrada' });
    }

    res.json(especialidad);
  } catch (error) {
    next(error);
  }
};

export const createEspecialidadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { nombre, descripcion } = req.body;

    if (typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const especialidad = await createEspecialidad({
      nombre: nombre.trim(),
      descripcion: typeof descripcion === 'string' ? descripcion : undefined,
    });

    res.status(201).json(especialidad);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe una especialidad con ese nombre' });
    }
    next(error);
  }
};

export const updateEspecialidadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'El id de la especialidad debe ser numérico' });
    }

    const payload = {
      nombre: typeof req.body.nombre === 'string' ? req.body.nombre : undefined,
      descripcion: typeof req.body.descripcion === 'string' ? req.body.descripcion : undefined,
    };

    const hasValues = Object.values(payload).some((v) => v !== undefined);
    if (!hasValues) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const especialidad = await updateEspecialidad(id, payload);
    res.json(especialidad);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }
    }
    next(error);
  }
};

export const deleteEspecialidadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'El id de la especialidad debe ser numérico' });
    }

    await deleteEspecialidad(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Especialidad no encontrada' });
    }
    next(error);
  }
};
