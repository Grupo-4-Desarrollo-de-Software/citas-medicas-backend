import { NextFunction, Request, Response } from 'express';
import { DatabaseError } from 'pg';
import { login, register } from '../services/auth.service';
import { UserRole } from '../models/user.model';

const isValidRole = (role: unknown): role is UserRole =>
  role === 'ADMIN' || role === 'OPERADOR';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const normalizedRole = typeof rol === 'string' ? (rol as string).toUpperCase() : rol;

    if (
      typeof nombre !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !nombre.trim() ||
      !email.trim() ||
      password.length < 6 ||
      !isValidRole(normalizedRole)
    ) {
      return res.status(400).json({ message: 'Datos inválidos para registro' });
    }

    const result = await register({
      nombre,
      email,
      password,
      rol: normalizedRole,
    });
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    if (error instanceof Error) {
      if (error.message === 'INVALID_ROLE') {
        return res.status(400).json({ message: 'Rol no permitido' });
      }
      if (error.message === 'JWT_SECRET_NOT_CONFIGURED') {
        return res.status(500).json({ message: 'Falta configurar JWT_SECRET' });
      }
    }

    next(error);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const result = await login({ email, password });
    return res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      if (error.message === 'JWT_SECRET_NOT_CONFIGURED') {
        return res.status(500).json({ message: 'Falta configurar JWT_SECRET' });
      }
    }
    next(error);
  }
};
