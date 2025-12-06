import database from '../db/database';
import {
  CreateEspecialidadDTO,
  Especialidad,
  UpdateEspecialidadDTO,
} from '../models/especialidad.model';

const buildUpdateSet = (data: UpdateEspecialidadDTO) => {
  const fields: string[] = [];
  const values: Array<string> = [];

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${fields.length + 1}`);
    values.push(data.nombre);
  }
  if (data.descripcion !== undefined) {
    fields.push(`descripcion = $${fields.length + 1}`);
    values.push(data.descripcion);
  }

  return { fields, values };
};

export const getEspecialidades = async (): Promise<Especialidad[]> => {
  const result = await database.query<Especialidad>(
    'SELECT * FROM especialidades ORDER BY nombre ASC',
  );
  return result.rows;
};

export const getEspecialidadById = async (id: number): Promise<Especialidad | null> => {
  const result = await database.query<Especialidad>(
    'SELECT * FROM especialidades WHERE id_especialidad = $1',
    [id],
  );
  return result.rowCount ? result.rows[0] : null;
};

export const createEspecialidad = async (
  dto: CreateEspecialidadDTO,
): Promise<Especialidad> => {
  const query = `
    INSERT INTO especialidades (nombre, descripcion)
    VALUES ($1, $2)
    RETURNING *
  `;

  const result = await database.query<Especialidad>(query, [dto.nombre, dto.descripcion ?? null]);
  return result.rows[0];
};

export const updateEspecialidad = async (
  id: number,
  dto: UpdateEspecialidadDTO,
): Promise<Especialidad> => {
  const { fields, values } = buildUpdateSet(dto);

  if (!fields.length) {
    throw new Error('NO_FIELDS');
  }

  const query = `
    UPDATE especialidades
    SET ${fields.join(', ')}
    WHERE id_especialidad = $${fields.length + 1}
    RETURNING *
  `;

  const result = await database.query<Especialidad>(query, [...values, id]);

  if (result.rowCount === 0) {
    throw new Error('NOT_FOUND');
  }

  return result.rows[0];
};

export const deleteEspecialidad = async (id: number): Promise<void> => {
  const result = await database.query('DELETE FROM especialidades WHERE id_especialidad = $1', [
    id,
  ]);

  if (result.rowCount === 0) {
    throw new Error('NOT_FOUND');
  }
};

export default {
  getEspecialidades,
  getEspecialidadById,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad,
};
