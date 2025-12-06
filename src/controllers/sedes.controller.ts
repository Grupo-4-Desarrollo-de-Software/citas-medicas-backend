import { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import {
  addEspecialidadToSede,
  createSede,
  deleteSede,
  getEspecialidadesBySede,
  getSedeById,
  getSedes,
  removeEspecialidadFromSede,
  updateSede,
} from '../services/sedes.service';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

export const listSedesController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sedes = await getSedes();
    res.json(sedes);
  } catch (error) {
    next(error);
  }
};

export const getSedeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'El id de la sede debe ser numérico' });
    }

    const sede = await getSedeById(id);
    if (!sede) {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }

    res.json(sede);
  } catch (error) {
    next(error);
  }
};

export const createSedeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, direccion, telefono } = req.body;

    if (typeof nombre !== 'string' || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const sede = await createSede({
      nombre: nombre.trim(),
      direccion: typeof direccion === 'string' ? direccion : undefined,
      telefono: typeof telefono === 'string' ? telefono : undefined,
    });

    res.status(201).json(sede);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe una sede con ese nombre' });
    }
    next(error);
  }
};

export const updateSedeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'El id de la sede debe ser numérico' });
    }

    const payload = {
      nombre: typeof req.body.nombre === 'string' ? req.body.nombre : undefined,
      direccion: typeof req.body.direccion === 'string' ? req.body.direccion : undefined,
      telefono: typeof req.body.telefono === 'string' ? req.body.telefono : undefined,
    };

    const hasValues = Object.values(payload).some((v) => v !== undefined);
    if (!hasValues) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    const sede = await updateSede(id, payload);
    res.json(sede);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({ message: 'Sede no encontrada' });
      }
    }
    next(error);
  }
};

export const deleteSedeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: 'El id de la sede debe ser numérico' });
    }

    await deleteSede(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }
    next(error);
  }
};

export const linkEspecialidadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const idSede = parseId(req.params.id_sede);
    const idEspecialidad = parseId(req.params.id_especialidad);

    if (idSede === null || idEspecialidad === null) {
      return res.status(400).json({ message: 'Los ids deben ser numéricos' });
    }

    await addEspecialidadToSede(idSede, idEspecialidad);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'SEDE_NOT_FOUND') {
        return res.status(404).json({ message: 'Sede no encontrada' });
      }
      if (error.message === 'ESPECIALIDAD_NOT_FOUND') {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }
    }
    next(error);
  }
};

export const unlinkEspecialidadController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const idSede = parseId(req.params.id_sede);
    const idEspecialidad = parseId(req.params.id_especialidad);

    if (idSede === null || idEspecialidad === null) {
      return res.status(400).json({ message: 'Los ids deben ser numéricos' });
    }

    await removeEspecialidadFromSede(idSede, idEspecialidad);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'SEDE_NOT_FOUND') {
        return res.status(404).json({ message: 'Sede no encontrada' });
      }
      if (error.message === 'ESPECIALIDAD_NOT_FOUND') {
        return res.status(404).json({ message: 'Especialidad no encontrada' });
      }
    }
    next(error);
  }
};

export const especialidadesBySedeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const idSede = parseId(req.params.id_sede);
    if (idSede === null) {
      return res.status(400).json({ message: 'El id de la sede debe ser numérico' });
    }

    const especialidades = await getEspecialidadesBySede(idSede);
    res.json(especialidades);
  } catch (error) {
    if (error instanceof Error && error.message === 'SEDE_NOT_FOUND') {
      return res.status(404).json({ message: 'Sede no encontrada' });
    }
    next(error);
  }
};
