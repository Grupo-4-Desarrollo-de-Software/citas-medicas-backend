import { NextFunction, Request, Response } from "express";
import {
  createPaciente,
  deletePaciente,
  getPacienteById,
  getPacientes,
  updatePaciente,
} from "../services/pacientes.service";
import { CreatePacienteDTO, UpdatePacienteDTO } from "../models/paciente.model";

export const listPacientesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pacientes = await getPacientes();
    res.json(pacientes);
  } catch (error) {
    next(error);
  }
};

export const getPacienteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "El id debe ser numérico" });
    }

    const paciente = await getPacienteById(id);

    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    res.json(paciente);
  } catch (error) {
    next(error);
  }
};

export const createPacienteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      nombre,
      email,
      telefono,
      fecha_nacimiento,
      documento,
      genero,
      direccion,
      ciudad,
    } = req.body;

    if (!nombre || !telefono) {
      return res
        .status(400)
        .json({ message: "nombre y telefono son requeridos" });
    }

    const dto: CreatePacienteDTO = {
      nombre,
      email,
      telefono,
      fecha_nacimiento,
      documento,
      genero,
      direccion,
      ciudad,
    };

    const paciente = await createPaciente(dto);
    return res.status(201).json(paciente);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return res.status(409).json({ message: "El paciente ya existe" });
      }
    }
    next(error);
  }
};

export const updatePacienteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "El id debe ser numérico" });
    }

    const dto: UpdatePacienteDTO = req.body;

    const paciente = await updatePaciente(id, dto);
    return res.json(paciente);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
      if (error.message.includes("duplicate key")) {
        return res.status(409).json({ message: "El paciente ya existe" });
      }
    }
    next(error);
  }
};

export const deletePacienteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "El id debe ser numérico" });
    }

    await deletePaciente(id);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }
    }
    next(error);
  }
};
