import pool from '../db/pool';

export type Canal = 'API' | 'SMS' | 'WEB';

export interface CreateCitaDTO {
  id_paciente: number;
  id_medico: number;
  fecha: string;
  hora: string;
  canal: Canal;
  estado?: string;
}

export interface Cita extends Required<CreateCitaDTO> {
  id_cita: number;
  created_at: string;
  updated_at: string;
}

export const createCita = async (data: CreateCitaDTO): Promise<Cita> => {
  const {
    id_paciente,
    id_medico,
    fecha,
    hora,
    canal,
    estado = 'PENDIENTE',
  } = data;

  const query = `
    INSERT INTO citas (id_paciente, id_medico, fecha, hora, canal, estado)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [id_paciente, id_medico, fecha, hora, canal, estado];
  const result = await pool.query<Cita>(query, values);

  return result.rows[0];
};

export const getCitas = async (): Promise<Cita[]> => {
  const query = `
    SELECT *
    FROM citas
    ORDER BY fecha ASC, hora ASC
  `;

  const result = await pool.query<Cita>(query);
  return result.rows;
};

export const getCitaById = async (id: number): Promise<Cita | null> => {
  const query = `
    SELECT *
    FROM citas
    WHERE id_cita = $1
  `;

  const result = await pool.query<Cita>(query, [id]);
  if (result.rowCount === 0) {
    return null;
  }

  return result.rows[0];
};
