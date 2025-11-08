import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import citasRouter from './routes/citas.routes';
import pool from './db/pool';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/citas', citasRouter);

// Centralized error handler to avoid duplicating try/catch response logic.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`API lista en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos', error);
    process.exit(1);
  }
};

startServer();
