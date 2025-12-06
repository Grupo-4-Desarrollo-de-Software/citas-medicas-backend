import 'dotenv/config';
import express from 'express';
import citasRouter from './routes/citas.routes';
import database from './db/database';
import errorMiddleware from './middlewares/error.middleware';
import runMigrations from './db/migrations';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

app.get('/api/health', async (_req, res, next) => {
  try {
    await database.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/citas', citasRouter);

app.use(errorMiddleware);

const startServer = async () => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await database.query('SELECT 1');
      
      // Ejecutar migraciones
      console.log('[SERVER] Iniciando migraciones de base de datos...');
      await runMigrations();
      
      app.listen(PORT, () => {
        console.log(`API lista en el puerto ${PORT}`);
      });
      return;
    } catch (error) {
      retries++;
      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
      console.error(
        `No se pudo conectar a la base de datos (intento ${retries}/${maxRetries}). Reintentando en ${waitTime}ms...`,
        error,
      );
      
      if (retries >= maxRetries) {
        console.error('Máximo de reintentos alcanzado. Abortando...');
        process.exit(1);
      }
      
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

startServer();
