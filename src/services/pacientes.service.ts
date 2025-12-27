import database from "../db/database";
import {
  CreatePacienteDTO,
  Paciente,
  UpdatePacienteDTO,
} from "../models/paciente.model";

const buildUpdateSet = (data: UpdatePacienteDTO) => {
  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${fields.length + 1}`);
    values.push(data.nombre);
  }
  if (data.email !== undefined) {
    fields.push(`email = $${fields.length + 1}`);
    values.push(data.email || null);
  }
  if (data.telefono !== undefined) {
    fields.push(`telefono = $${fields.length + 1}`);
    values.push(data.telefono);
  }
  if (data.fecha_nacimiento !== undefined) {
    fields.push(`fecha_nacimiento = $${fields.length + 1}`);
    values.push(data.fecha_nacimiento || null);
  }
  if (data.documento !== undefined) {
    fields.push(`documento = $${fields.length + 1}`);
    values.push(data.documento || null);
  }
  if (data.genero !== undefined) {
    fields.push(`genero = $${fields.length + 1}`);
    values.push(data.genero || null);
  }
  if (data.direccion !== undefined) {
    fields.push(`direccion = $${fields.length + 1}`);
    values.push(data.direccion || null);
  }
  if (data.ciudad !== undefined) {
    fields.push(`ciudad = $${fields.length + 1}`);
    values.push(data.ciudad || null);
  }

  return { fields, values };
};

export const getPacientes = async (): Promise<Paciente[]> => {
  const result = await database.query<Paciente>(
    "SELECT * FROM pacientes ORDER BY nombre ASC"
  );
  return result.rows;
};

export const getPacienteById = async (id: number): Promise<Paciente | null> => {
  const result = await database.query<Paciente>(
    "SELECT * FROM pacientes WHERE id_paciente = $1",
    [id]
  );
  return result.rowCount ? result.rows[0] : null;
};

export const getPacienteByEmail = async (
  email: string
): Promise<Paciente | null> => {
  const result = await database.query<Paciente>(
    "SELECT * FROM pacientes WHERE email = $1",
    [email]
  );
  return result.rowCount ? result.rows[0] : null;
};

export const getPacienteByTelefono = async (
  telefono: string
): Promise<Paciente | null> => {
  const result = await database.query<Paciente>(
    "SELECT * FROM pacientes WHERE telefono = $1",
    [telefono]
  );
  return result.rowCount ? result.rows[0] : null;
};

export const createPaciente = async (
  dto: CreatePacienteDTO
): Promise<Paciente> => {
  const query = `
    INSERT INTO pacientes (nombre, email, telefono, fecha_nacimiento, documento, genero, direccion, ciudad)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const result = await database.query<Paciente>(query, [
    dto.nombre,
    dto.email ?? null,
    dto.telefono,
    dto.fecha_nacimiento ?? null,
    dto.documento ?? null,
    dto.genero ?? null,
    dto.direccion ?? null,
    dto.ciudad ?? null,
  ]);

  return result.rows[0];
};

export const updatePaciente = async (
  id: number,
  dto: UpdatePacienteDTO
): Promise<Paciente> => {
  const { fields, values } = buildUpdateSet(dto);

  if (!fields.length) {
    throw new Error("NO_FIELDS");
  }

  const query = `
    UPDATE pacientes
    SET ${fields.join(", ")}
    WHERE id_paciente = $${fields.length + 1}
    RETURNING *
  `;

  const result = await database.query<Paciente>(query, [...values, id]);

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }

  return result.rows[0];
};

export const deletePaciente = async (id: number): Promise<void> => {
  const result = await database.query(
    "DELETE FROM pacientes WHERE id_paciente = $1",
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }
};

export default {
  getPacientes,
  getPacienteById,
  getPacienteByEmail,
  getPacienteByTelefono,
  createPaciente,
  updatePaciente,
  deletePaciente,
};
