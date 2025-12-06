import fs from 'fs';
import path from 'path';
import pool from './pool';

const runMigrations = async () => {
  // Buscar migraciones en diferentes ubicaciones posibles
  const possiblePaths = [
    path.join(__dirname, '../../db/migrations'),      // En dist/db/migrations
    path.join(process.cwd(), 'db/migrations'),         // Desde raíz del proyecto
    path.join(process.cwd(), 'src/db/migrations'),     // Si se ejecuta desde src
  ];

  let migrationsDir: string | null = null;

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      migrationsDir = dirPath;
      console.log(`[MIGRATIONS] Directorio encontrado en: ${dirPath}`);
      break;
    }
  }

  if (!migrationsDir) {
    console.error('[MIGRATIONS] Directorio de migraciones no encontrado en ninguna ubicación:', possiblePaths);
    throw new Error('No se encontró el directorio de migraciones');
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.error('[MIGRATIONS] No hay archivos .sql en:', migrationsDir);
    throw new Error('No hay migraciones SQL disponibles');
  }

  console.log(`[MIGRATIONS] Encontradas ${migrationFiles.length} migraciones`);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`[MIGRATIONS] Leyendo: ${filePath}`);
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`[MIGRATIONS] SQL leído: ${sql.substring(0, 100)}...`);

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
        console.error('[MIGRATIONS] Stack:', error.stack);
        throw error;
      }
    }
  }

  console.log('[MIGRATIONS] ✓ Todas las migraciones completadas');
};

export default runMigrations;
