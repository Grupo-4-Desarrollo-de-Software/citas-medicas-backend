import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AuthTokenPayload, verifyToken } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const authenticate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    return next();
  } catch (error) {
    if (error instanceof Error && error.message === 'JWT_SECRET_NOT_CONFIGURED') {
      return res.status(500).json({ message: 'Falta configurar JWT_SECRET' });
    }
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const requireRole = (roles: UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para esta acción' });
    }

    return next();
  };
};
