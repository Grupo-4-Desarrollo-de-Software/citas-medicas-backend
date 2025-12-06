import { Pool, PoolConfig } from 'pg';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Si existe DATABASE_URL (Render), usarla directamente
const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseNumber(process.env.DB_PORT, 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

console.info(
  `[DB] Pool configurado hacia ${
    process.env.DATABASE_URL
      ? 'DATABASE_URL (Render)'
      : `${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`
  }`,
);

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de PostgreSQL', err);
});

export default pool;
