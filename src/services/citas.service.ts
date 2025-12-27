import { PoolClient } from "pg";
import database, { QueryParams } from "../db/database";
import { Cita, CreateCitaDTO } from "../models/cita.model";
import smsService from "./sms.service";

export type { CreateCitaDTO };
export type Canal = CreateCitaDTO["canal"];

export const createCita = async (
  data: CreateCitaDTO,
  idempotencyKey?: string
): Promise<{ cita: Cita; created: boolean }> => {
  const payload = { ...data, estado: data.estado ?? "PENDIENTE" };

  // If no idempotency key provided, do a simple create with schedule validation.
  if (!idempotencyKey) {
    // validate schedule conflict
    await ensureNoScheduleConflict(payload);

    const columns = [
      "id_paciente",
      "id_especialidad",
      "id_sede",
      "fecha",
      "hora",
      "canal",
      "estado",
    ];
    const values: QueryParams = [
      payload.id_paciente,
      payload.id_especialidad,
      payload.id_sede,
      payload.fecha,
      payload.hora,
      payload.canal,
      payload.estado,
    ];

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
      INSERT INTO citas (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await database.query<Cita>(query, values);
    const cita = result.rows[0];

    // Send SMS notification if enabled and telefono provided
    try {
      if (payload.telefono) {
        const text = `Su cita ha sido registrada para ${payload.fecha} a las ${payload.hora}.`;
        await smsService.sendSms(payload.telefono, text);
      }
    } catch (err) {
      console.error("[CITAS] Error sending SMS after create", err);
    }
    return { cita, created: true };
  }

  // With idempotency: use a transaction to create cita and idempotency record.
  const client: PoolClient = await database.beginTransaction();

  try {
    // Check if key already exists
    const existingKeyRes = await client.query(
      "SELECT resource_id FROM idempotency_keys WHERE key = $1",
      [idempotencyKey]
    );

    if (existingKeyRes.rowCount) {
      const resourceId = existingKeyRes.rows[0].resource_id as number;
      const existingCitaRes = await client.query<Cita>(
        "SELECT * FROM citas WHERE id_cita = $1",
        [resourceId]
      );

      await database.commit(client);
      return { cita: existingCitaRes.rows[0], created: false };
    }

    // Ensure no schedule conflict before inserting
    await ensureNoScheduleConflict(payload, client);

    const columns = [
      "id_paciente",
      "id_especialidad",
      "id_sede",
      "fecha",
      "hora",
      "canal",
      "estado",
    ];
    const values: QueryParams = [
      payload.id_paciente,
      payload.id_especialidad,
      payload.id_sede,
      payload.fecha,
      payload.hora,
      payload.canal,
      payload.estado,
    ];

    const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
    const query = `INSERT INTO citas (${columns.join(
      ", "
    )}) VALUES (${placeholders}) RETURNING *`;
    const insertRes = await client.query<Cita>(query, values);
    const nuevaCita = insertRes.rows[0];

    // Store idempotency key mapping
    await client.query(
      "INSERT INTO idempotency_keys(key, entity, resource_id) VALUES ($1, $2, $3)",
      [idempotencyKey, "citas", nuevaCita.id_cita]
    );

    await database.commit(client);
    // Send SMS notification if enabled and telefono provided
    try {
      if (payload.telefono) {
        const text = `Su cita ha sido registrada para ${payload.fecha} a las ${payload.hora}.`;
        await smsService.sendSms(payload.telefono, text);
      }
    } catch (err) {
      console.error("[CITAS] Error sending SMS after create (idempotent)", err);
    }

    return { cita: nuevaCita, created: true };
  } catch (error) {
    await database.rollback(client);
    throw error;
  }
};

/**
 * Comprueba si hay una cita en la misma especialidad/sede/fecha/hora (no anulada).
 * Si se pasa un cliente de transacción, usa ese cliente para las consultas.
 */
const ensureNoScheduleConflict = async (
  payload: CreateCitaDTO,
  client?: PoolClient
) => {
  const params = [
    payload.id_especialidad,
    payload.id_sede,
    payload.fecha,
    payload.hora,
  ];
  const sql = `
    SELECT 1 FROM citas
    WHERE id_especialidad = $1 AND id_sede = $2 AND fecha = $3 AND hora = $4 AND estado != 'CANCELADO'
    LIMIT 1
  `;

  const result = client
    ? await client.query(sql, params)
    : await database.query(sql, params);

  if (result.rowCount) {
    throw new Error("SCHEDULE_CONFLICT");
  }
};

export const getCitas = async (): Promise<Cita[]> => {
  const result = await database.query<Cita>(
    "SELECT * FROM citas ORDER BY fecha ASC, hora ASC"
  );
  return result.rows;
};

export const getCitaById = async (id: number): Promise<Cita | null> => {
  const result = await database.query<Cita>(
    "SELECT * FROM citas WHERE id_cita = $1",
    [id]
  );
  return result.rowCount ? result.rows[0] : null;
};

export const confirmCita = async (
  id: number,
  telefono?: string
): Promise<Cita> => {
  const current = await getCitaById(id);

  if (!current) {
    throw new Error("NOT_FOUND");
  }

  if (current.estado === "CANCELADO") {
    throw new Error("ALREADY_CANCELLED");
  }

  const query = `
    UPDATE citas
    SET estado = $1, confirmed_at = NOW(), cancelled_at = NULL
    WHERE id_cita = $2
    RETURNING *
  `;

  const result = await database.query<Cita>(query, ["CONFIRMADO", id]);

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }

  return result.rows[0];
};

export const cancelCita = async (id: number): Promise<Cita> => {
  const current = await getCitaById(id);

  if (!current) {
    throw new Error("NOT_FOUND");
  }

  if (current.estado === "CANCELADO") {
    return current;
  }

  const query = `
    UPDATE citas
    SET estado = 'CANCELADO', cancelled_at = NOW()
    WHERE id_cita = $1
    RETURNING *
  `;

  const result = await database.query<Cita>(query, [id]);

  if (result.rowCount === 0) {
    throw new Error("NOT_FOUND");
  }

  return result.rows[0];
};
