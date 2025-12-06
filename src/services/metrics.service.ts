import database from '../db/database';

export interface OperationMetrics {
  reservas: number;
  cancelaciones: number;
  confirmaciones: number;
  pendientes: number;
}

export const getOperationMetrics = async (): Promise<OperationMetrics> => {
  const query = `
    SELECT
      COUNT(*)::int AS reservas,
      COUNT(*) FILTER (WHERE estado = 'CANCELADO')::int AS cancelaciones,
      COUNT(*) FILTER (WHERE estado = 'CONFIRMADO')::int AS confirmaciones,
      COUNT(*) FILTER (WHERE estado = 'PENDIENTE')::int AS pendientes
    FROM citas
  `;

  const result = await database.query<OperationMetrics>(query);
  return result.rows[0];
};

export default { getOperationMetrics };
