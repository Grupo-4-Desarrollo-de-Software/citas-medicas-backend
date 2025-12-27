"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pool_1 = __importDefault(require("../src/db/pool"));
const runMigrations = async () => {
    const migrationsDir = path_1.default.join(__dirname, '../db/migrations');
    const migrationFiles = fs_1.default
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();
    console.log(`[MIGRATIONS] Encontradas ${migrationFiles.length} migraciones`);
    for (const file of migrationFiles) {
        const filePath = path_1.default.join(migrationsDir, file);
        const sql = fs_1.default.readFileSync(filePath, 'utf-8');
        try {
            console.log(`[MIGRATIONS] Ejecutando: ${file}`);
            await pool_1.default.query(sql);
            console.log(`[MIGRATIONS] ✓ ${file} completada`);
        }
        catch (error) {
            // Ignorar errores de "already exists"
            if (error.code === '42P07' || error.code === '42701') {
                console.log(`[MIGRATIONS] ⊘ ${file} ya existe (saltando)`);
            }
            else {
                console.error(`[MIGRATIONS] ✗ Error en ${file}:`, error.message);
                throw error;
            }
        }
    }
    console.log('[MIGRATIONS] ✓ Todas las migraciones completadas');
    await pool_1.default.end();
};
runMigrations().catch((error) => {
    console.error('[MIGRATIONS] Error fatal:', error);
    process.exit(1);
});
