import { NextFunction, Request, Response } from "express";
import {
  createOperador,
  deleteOperador,
  getOperadorById,
  getOperadores,
  updateOperador,
} from "../services/operadores.service";
import { CreateOperadorDTO, UpdateOperadorDTO } from "../models/operador.model";

export const listOperadoresController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const operadores = await getOperadores();
    res.json(operadores);
  } catch (error) {
    next(error);
  }
};

export const getOperadorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "El id debe ser numérico" });
    }

    const operador = await getOperadorById(id);

    if (!operador) {
      return res.status(404).json({ message: "Operador no encontrado" });
    }

    res.json(operador);
  } catch (error) {
    next(error);
  }
};

export const createOperadorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_usuario, activo } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ message: "id_usuario es requerido" });
    }

    const dto: CreateOperadorDTO = {
      id_usuario,
      activo,
    };

    const operador = await createOperador(dto);
    return res.status(201).json(operador);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USUARIO_NO_ENCONTRADO_O_NO_ES_OPERADOR") {
        return res
          .status(404)
          .json({ message: "Usuario no encontrado o no es un operador" });
      }
      if (error.message.includes("duplicate key")) {
        return res.status(409).json({ message: "El operador ya existe" });
      }
    }
    next(error);
  }
};

export const updateOperadorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "El id debe ser numérico" });
    }

    const dto: UpdateOperadorDTO = req.body;

    const operador = await updateOperador(id, dto);
    return res.json(operador);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Operador no encontrado" });
      }
      if (error.message === "NO_FIELDS") {
        return res
          .status(400)
          .json({ message: "Se debe proporcionar al menos un campo" });
      }
    }
    next(error);
  }
};

export const deleteOperadorController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "El id debe ser numérico" });
    }

    await deleteOperador(id);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Operador no encontrado" });
      }
    }
    next(error);
  }
};
