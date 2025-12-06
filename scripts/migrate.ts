import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pool from '../src/db/pool';

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, '../db/migrations');
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  console.log(`[MIGRATIONS] Encontradas ${migrationFiles.length} migraciones`);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      console.log(`[MIGRATIONS] Ejecutando: ${file}`);
      await pool.query(sql);
      console.log(`[MIGRATIONS] ✓ ${file} completada`);
    } catch (error: any) {
      // Ignorar errores de "already exists"
      if (error.code === '42P07' || error.code === '42701') {
        console.log(`[MIGRATIONS] ⊘ ${file} ya existe (saltando)`);
      } else {
        console.error(`[MIGRATIONS] ✗ Error en ${file}:`, error.message);
        throw error;
      }
    }
  }

  console.log('[MIGRATIONS] ✓ Todas las migraciones completadas');
  await pool.end();
};

runMigrations().catch((error) => {
  console.error('[MIGRATIONS] Error fatal:', error);
  process.exit(1);
});
