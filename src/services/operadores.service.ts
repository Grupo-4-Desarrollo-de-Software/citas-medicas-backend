import database from "../db/database";
import {
  CreateOperadorDTO,
  Operador,
  OperadorWithUser,
  UpdateOperadorDTO,
} from "../models/operador.model";
import { PublicUsuario, Usuario } from "../models/user.model";

export const getOperadores = async (): Promise<OperadorWithUser[]> => {
  const result = await database.query<
    Operador & {
      usuario_id: number;
      usuario_nombre: string;
      usuario_email: string;
      usuario_rol: string;
    }
  >(
    `SELECT o.*, u.id_usuario as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email, u.rol as usuario_rol
     FROM operadores o
     JOIN usuarios u ON o.id_usuario = u.id_usuario
     ORDER BY u.nombre ASC`
  );

  return result.rows.map((row) => ({
    id_operador: row.id_operador,
    id_usuario: row.id_usuario,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at,
    usuario: {
      id_usuario: row.usuario_id,
      nombre: row.usuario_nombre,
      email: row.usuario_email,
      rol: row.usuario_rol as any,
      created_at: "",
      updated_at: "",
    },
  }));
};

export const getOperadorById = async (
  id: number
): Promise<OperadorWithUser | null> => {
  const result = await database.query<
    Operador & {
      usuario_id: number;
      usuario_nombre: string;
      usuario_email: string;
      usuario_rol: string;
    }
  >(
    `SELECT o.*, u.id_usuario as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email, u.rol as usuario_rol
     FROM operadores o
     JOIN usuarios u ON o.id_usuario = u.id_usuario
     WHERE o.id_operador = $1`,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  const row = result.rows[0];
  return {
    id_operador: row.id_operador,
    id_usuario: row.id_usuario,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at,
    usuario: {
      id_usuario: row.usuario_id,
      nombre: row.usuario_nombre,
      email: row.usuario_email,
      rol: row.usuario_rol as any,
      created_at: "",
      updated_at: "",
    },
  };
};

export const getOperadorByUsuarioId = async (
  id_usuario: number
): Promise<OperadorWithUser | null> => {
  const result = await database.query<
    Operador & {
      usuario_id: number;
      usuario_nombre: string;
      usuario_email: string;
      usuario_rol: string;
    }
  >(
    `SELECT o.*, u.id_usuario as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email, u.rol as usuario_rol
     FROM operadores o
     JOIN usuarios u ON o.id_usuario = u.id_usuario
     WHERE o.id_usuario = $1`,
    [id_usuario]
  );

  if (!result.rowCount) {
    return null;
  }

  const row = result.rows[0];
  return {
    id_operador: row.id_operador,
    id_usuario: row.id_usuario,
    activo: row.activo,
    created_at: row.created_at,
    updated_at: row.updated_at,
    usuario: {
      id_usuario: row.usuario_id,
      nombre: row.usuario_nombre,
      email: row.usuario_email,
      rol: row.usuario_rol as any,
      created_at: "",
      updated_at: "",
    },
  };
};

export const createOperador = async (
  dto: CreateOperadorDTO
): Promise<OperadorWithUser> => {
  // Verificar que el usuario existe y es OPERADOR
  const userResult = await database.query<Usuario>(
    "SELECT * FROM usuarios WHERE id_usuario = $1 AND rol = $2",
    [dto.id_usuario, "OPERADOR"]
  );

  if (!userResult.rowCount) {
    throw new Error("USUARIO_NO_ENCONTRADO_O_NO_ES_OPERADOR");
  }

  const user = userResult.rows[0];

  const query = `
    INSERT INTO operadores (id_usuario, activo)
    VALUES ($1, $2)
    RETURNING *
  `;

  const result = await database.query<Operador>(query, [
    dto.id_usuario,
    dto.activo ?? true,
  ]);

  const operador = result.rows[0];

  return {
    ...operador,
    usuario: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const updateOperador = async (
  id: number,
  dto: UpdateOperadorDTO
): Promise<OperadorWithUser> => {
  if (dto.activo === undefined) {
    throw new Error("NO_FIELDS");
  }

  const query = `
    UPDATE operadores
    SET activo = $1
    WHERE id_operador = $2
    RETURNING *
  `;

  const result = await database.query<Operador>(query, [dto.activo, id]);

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }

  const operador = result.rows[0];

  // Obtener datos del usuario
  const userResult = await database.query<Usuario>(
    "SELECT * FROM usuarios WHERE id_usuario = $1",
    [operador.id_usuario]
  );

  const user = userResult.rows[0];

  return {
    ...operador,
    usuario: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const deleteOperador = async (id: number): Promise<void> => {
  const result = await database.query(
    "DELETE FROM operadores WHERE id_operador = $1",
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }
};

export default {
  getOperadores,
  getOperadorById,
  getOperadorByUsuarioId,
  createOperador,
  updateOperador,
  deleteOperador,
};
