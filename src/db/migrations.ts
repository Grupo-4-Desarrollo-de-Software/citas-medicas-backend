import fs from 'fs';
import path from 'path';
import pool from './pool';

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, '../db/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.warn('[MIGRATIONS] Directorio de migraciones no encontrado');
    return;
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('[MIGRATIONS] No hay migraciones para ejecutar');
    return;
  }

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
};

export default runMigrations;
