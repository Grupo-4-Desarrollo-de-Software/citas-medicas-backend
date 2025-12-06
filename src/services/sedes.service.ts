import database from '../db/database';
import { Especialidad } from '../models/especialidad.model';
import { CreateSedeDTO, Sede, UpdateSedeDTO } from '../models/sede.model';

const buildUpdateSet = (data: UpdateSedeDTO) => {
  const fields: string[] = [];
  const values: Array<string> = [];

  if (data.nombre !== undefined) {
    fields.push(`nombre = $${fields.length + 1}`);
    values.push(data.nombre);
  }
  if (data.direccion !== undefined) {
    fields.push(`direccion = $${fields.length + 1}`);
    values.push(data.direccion);
  }
  if (data.telefono !== undefined) {
    fields.push(`telefono = $${fields.length + 1}`);
    values.push(data.telefono);
  }

  return { fields, values };
};

export const getSedes = async (): Promise<Sede[]> => {
  const result = await database.query<Sede>('SELECT * FROM sedes ORDER BY nombre ASC');
  return result.rows;
};

export const getSedeById = async (id: number): Promise<Sede | null> => {
  const result = await database.query<Sede>('SELECT * FROM sedes WHERE id_sede = $1', [id]);
  return result.rowCount ? result.rows[0] : null;
};

export const createSede = async (dto: CreateSedeDTO): Promise<Sede> => {
  const query = `
    INSERT INTO sedes (nombre, direccion, telefono)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await database.query<Sede>(query, [
    dto.nombre,
    dto.direccion ?? null,
    dto.telefono ?? null,
  ]);

  return result.rows[0];
};

export const updateSede = async (id: number, dto: UpdateSedeDTO): Promise<Sede> => {
  const { fields, values } = buildUpdateSet(dto);

  if (!fields.length) {
    throw new Error('NO_FIELDS');
  }

  const query = `
    UPDATE sedes
    SET ${fields.join(', ')}
    WHERE id_sede = $${fields.length + 1}
    RETURNING *
  `;

  const result = await database.query<Sede>(query, [...values, id]);

  if (result.rowCount === 0) {
    throw new Error('NOT_FOUND');
  }

  return result.rows[0];
};

export const deleteSede = async (id: number): Promise<void> => {
  const result = await database.query('DELETE FROM sedes WHERE id_sede = $1', [id]);

  if (result.rowCount === 0) {
    throw new Error('NOT_FOUND');
  }
};

const ensureSedeExists = async (idSede: number) => {
  const sede = await getSedeById(idSede);
  if (!sede) {
    throw new Error('SEDE_NOT_FOUND');
  }
};

const ensureEspecialidadExists = async (idEspecialidad: number) => {
  const result = await database.query('SELECT 1 FROM especialidades WHERE id_especialidad = $1', [
    idEspecialidad,
  ]);

  if (result.rowCount === 0) {
    throw new Error('ESPECIALIDAD_NOT_FOUND');
  }
};

export const addEspecialidadToSede = async (
  idSede: number,
  idEspecialidad: number,
): Promise<void> => {
  await ensureSedeExists(idSede);
  await ensureEspecialidadExists(idEspecialidad);

  await database.query(
    `
    INSERT INTO sede_especialidad (id_sede, id_especialidad)
    VALUES ($1, $2)
    ON CONFLICT (id_sede, id_especialidad) DO NOTHING
  `,
    [idSede, idEspecialidad],
  );
};

export const removeEspecialidadFromSede = async (
  idSede: number,
  idEspecialidad: number,
): Promise<void> => {
  const result = await database.query(
    'DELETE FROM sede_especialidad WHERE id_sede = $1 AND id_especialidad = $2',
    [idSede, idEspecialidad],
  );

  if (result.rowCount === 0) {
    // check existence for better error detail
    await ensureSedeExists(idSede);
    await ensureEspecialidadExists(idEspecialidad);
  }
};

export const getEspecialidadesBySede = async (
  idSede: number,
): Promise<Array<Especialidad>> => {
  await ensureSedeExists(idSede);

  const query = `
    SELECT e.*
    FROM especialidades e
    INNER JOIN sede_especialidad se ON se.id_especialidad = e.id_especialidad
    WHERE se.id_sede = $1
    ORDER BY e.nombre ASC
  `;

  const result = await database.query<Especialidad>(query, [idSede]);
  return result.rows;
};

export default {
  getSedes,
  getSedeById,
  createSede,
  updateSede,
  deleteSede,
  addEspecialidadToSede,
  removeEspecialidadFromSede,
  getEspecialidadesBySede,
};
