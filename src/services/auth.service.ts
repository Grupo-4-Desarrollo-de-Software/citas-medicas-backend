import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import database from "../db/database";
import { PublicUsuario, UserRole, Usuario } from "../models/user.model";

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUsuario;
  token: string;
}

export interface AuthTokenPayload {
  sub: number;
  role: UserRole;
  email: string;
  nombre: string;
}

const allowedRoles: UserRole[] = ["ADMIN", "OPERADOR"];
const SALT_ROUNDS = 10;

const toPublicUser = (user: Usuario): PublicUsuario => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...rest } = user;
  return rest;
};

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }

  return secret;
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const signToken = (user: PublicUsuario): string => {
  const secret = getJwtSecret();
  const payload: AuthTokenPayload = {
    sub: user.id_usuario,
    role: user.rol,
    email: user.email,
    nombre: user.nombre,
  };

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  } as any);
};

export const register = async (dto: RegisterDTO): Promise<AuthResult> => {
  const role = dto.rol;

  if (!allowedRoles.includes(role)) {
    throw new Error("INVALID_ROLE");
  }

  const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
  const email = normalizeEmail(dto.email);

  const query = `
    INSERT INTO usuarios (nombre, email, password_hash, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await database.query<Usuario>(query, [
    dto.nombre.trim(),
    email,
    hashedPassword,
    role,
  ]);

  const user = toPublicUser(result.rows[0]);
  const token = signToken(user);

  return { user, token };
};

export const login = async (dto: LoginDTO): Promise<AuthResult> => {
  const email = normalizeEmail(dto.email);
  const result = await database.query<Usuario>(
    "SELECT * FROM usuarios WHERE email = $1",
    [email]
  );

  if (result.rowCount === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(dto.password, user.password_hash);

  if (!passwordMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const publicUser = toPublicUser(user);
  const token = signToken(publicUser);

  return { user: publicUser, token };
};

export const verifyToken = (token: string): AuthTokenPayload => {
  const secret = getJwtSecret();
  const payload = jwt.verify(token, secret) as any as AuthTokenPayload;
  return payload;
};

export const getUserById = async (
  id: number
): Promise<PublicUsuario | null> => {
  const result = await database.query<Usuario>(
    "SELECT * FROM usuarios WHERE id_usuario = $1",
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return toPublicUser(result.rows[0]);
};

export default {
  register,
  login,
  verifyToken,
  getUserById,
};
