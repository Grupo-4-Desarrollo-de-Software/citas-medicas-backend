import { QueryResultRow, PoolClient } from 'pg';
import database, { QueryParams } from '../db/database';
import { Cita, CreateCitaDTO } from '../models/cita.model';
import smsService from './sms.service';

export type { CreateCitaDTO };
export type Canal = CreateCitaDTO['canal'];

type Entity = 'cita';

interface EntityConfig {
  table: string;
  idColumn: string;
  orderBy?: string;
  insertableColumns: string[];
}

const ENTITY_CONFIG: Record<Entity, EntityConfig> = {
  cita: {
    table: 'citas',
    idColumn: 'id_cita',
    orderBy: 'ORDER BY fecha ASC, hora ASC',
    insertableColumns: [
      'id_paciente',
      'id_medico',
      'fecha',
      'hora',
      'canal',
      'estado',
    ],
  },
};

/**
 * findAll('cita') → devuelve todas las filas de la tabla citas con orden definido.
 */
export const findAll = async <T extends QueryResultRow>(
  entity: Entity,
): Promise<T[]> => {
  const { table, orderBy } = ENTITY_CONFIG[entity];
  const query = `SELECT * FROM ${table} ${orderBy ?? ''}`.trim();
  const result = await database.query<T>(query);
  return result.rows;
};

/**
 * findById('cita', id) → busca la fila por su columna primaria.
 */
export const findById = async <T extends QueryResultRow>(
  entity: Entity,
  id: number,
): Promise<T | null> => {
  const { table, idColumn } = ENTITY_CONFIG[entity];
  const query = `SELECT * FROM ${table} WHERE ${idColumn} = $1`;
  const result = await database.query<T>(query, [id]);
  return result.rowCount ? result.rows[0] : null;
};

/**
 * insert('cita', data) → arma dinámicamente el INSERT de acuerdo al payload recibido.
 */
export const insert = async <T extends QueryResultRow>(
  entity: Entity,
  data: Record<string, unknown>,
): Promise<T> => {
  const { table, insertableColumns } = ENTITY_CONFIG[entity];

  const columns: string[] = [];
  const values: QueryParams = [];

  insertableColumns.forEach((column) => {
    if (data[column] !== undefined) {
      columns.push(column);
      values.push(
        data[column] as string | number | boolean | null | Date,
      );
    }
  });

  if (columns.length === 0) {
    throw new Error('No hay campos válidos para insertar');
  }

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await database.query<T>(query, values);
  return result.rows[0];
};

export const createCita = async (
  data: CreateCitaDTO,
  idempotencyKey?: string,
): Promise<{ cita: Cita; created: boolean }> => {
  const payload = { ...data, estado: data.estado ?? 'PENDIENTE' };

  // If no idempotency key provided, do a simple create with schedule validation.
  if (!idempotencyKey) {
    // validate schedule conflict
    await ensureNoScheduleConflict(payload);
    const cita = await insert<Cita>('cita', payload);
    // Send SMS notification if enabled and telefono provided
    try {
      if (payload.telefono) {
        const text = `Su cita ha sido registrada para ${payload.fecha} a las ${payload.hora}.`;
        await smsService.sendSms(payload.telefono, text);
      }
    } catch (err) {
      console.error('[CITAS] Error sending SMS after create', err);
    }
    return { cita, created: true };
  }

  // With idempotency: use a transaction to create cita and idempotency record.
  const client: PoolClient = await database.beginTransaction();

  try {
    // Check if key already exists
    const existingKeyRes = await client.query(
      'SELECT resource_id FROM idempotency_keys WHERE key = $1',
      [idempotencyKey],
    );

    if (existingKeyRes.rowCount) {
      const resourceId = existingKeyRes.rows[0].resource_id as number;
      const existingCitaRes = await client.query<Cita>(
        'SELECT * FROM citas WHERE id_cita = $1',
        [resourceId],
      );

      await database.commit(client);
      return { cita: existingCitaRes.rows[0], created: false };
    }

    // Ensure no schedule conflict before inserting
    await ensureNoScheduleConflict(payload, client);

    const columns: string[] = [];
    const values: QueryParams = [];

    // Build insert dynamically like the generic insert but using the transaction client
    const insertable = ['id_paciente', 'id_medico', 'fecha', 'hora', 'canal', 'estado'];
    insertable.forEach((column) => {
      if ((payload as any)[column] !== undefined) {
        columns.push(column);
        values.push((payload as any)[column] as string | number | boolean | null | Date);
      }
    });

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO citas (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const insertRes = await client.query<Cita>(query, values);
    const nuevaCita = insertRes.rows[0];

    // Store idempotency key mapping
    await client.query(
      'INSERT INTO idempotency_keys(key, entity, resource_id) VALUES ($1, $2, $3)',
      [idempotencyKey, 'citas', nuevaCita.id_cita],
    );

    await database.commit(client);
    // Send SMS notification if enabled and telefono provided
    try {
      if ((payload as any).telefono) {
        const text = `Su cita ha sido registrada para ${payload.fecha} a las ${payload.hora}.`;
        await smsService.sendSms((payload as any).telefono, text);
      }
    } catch (err) {
      console.error('[CITAS] Error sending SMS after create (idempotent)', err);
    }

    return { cita: nuevaCita, created: true };
  } catch (error) {
    await database.rollback(client);
    throw error;
  }
};

/**
 * Comprueba si hay una cita en el mismo medico/fecha/hora (no anulada).
 * Si se pasa un cliente de transacción, usa ese cliente para las consultas.
 */
const ensureNoScheduleConflict = async (
  payload: CreateCitaDTO,
  client?: PoolClient,
) => {
  const params = [payload.id_medico, payload.fecha, payload.hora];
  const sql = `
    SELECT 1 FROM citas
    WHERE id_medico = $1 AND fecha = $2 AND hora = $3 AND estado != 'CANCELADO'
    LIMIT 1
  `;

  const result = client
    ? await client.query(sql, params)
    : await database.query(sql, params);

  if (result.rowCount) {
    throw new Error('SCHEDULE_CONFLICT');
  }
};

export const getCitas = async (): Promise<Cita[]> => {
  return findAll<Cita>('cita');
};

export const getCitaById = async (id: number): Promise<Cita | null> => {
  return findById<Cita>('cita', id);
};

export const confirmCita = async (id: number, telefono?: string): Promise<Cita> => {
  const query = `
    UPDATE citas
    SET estado = $1, confirmed_at = NOW()
    WHERE id_cita = $2
    RETURNING *
  `;

  const result = await database.query<Cita>(query, ['CONFIRMADO', id]);

  if (result.rowCount === 0) {
    throw new Error('NOT_FOUND');
  }

  return result.rows[0];
};
