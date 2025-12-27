import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import citasRouter from "./routes/citas.routes";
import database from "./db/database";
import errorMiddleware from "./middlewares/error.middleware";
import runMigrations from "./db/migrations";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import sedesRouter from "./routes/sedes.routes";
import especialidadesRouter from "./routes/especialidades.routes";
import metricsRouter from "./routes/metrics.routes";
import pacientesRouter from "./routes/pacientes.routes";
import operadoresRouter from "./routes/operadores.routes";
import { specs } from "./swagger";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { swaggerOptions: { url: "/api-docs/swagger.json" } })
);
app.get("/api-docs/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

app.get("/api/health", async (_req, res, next) => {
  try {
    await database.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRouter);
app.use("/api/citas", citasRouter);
app.use("/api/sedes", sedesRouter);
app.use("/api/especialidades", especialidadesRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/pacientes", pacientesRouter);
app.use("/api/operadores", operadoresRouter);

app.use(errorMiddleware);

const startServer = async () => {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await database.query("SELECT 1");

      // Ejecutar migraciones
      try {
        console.log("[SERVER] Iniciando migraciones de base de datos...");
        await runMigrations();
      } catch (migrationError) {
        console.error("[SERVER] Error en migraciones:", migrationError);
        console.log(
          "[SERVER] Intentando continuar sin migraciones (pueden estar creadas manualmente)..."
        );
      }

      app.listen(PORT, () => {
        console.log(`API lista en el puerto ${PORT}`);
      });
      return;
    } catch (error) {
      retries++;
      const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
      console.error(
        `No se pudo conectar a la base de datos (intento ${retries}/${maxRetries}). Reintentando en ${waitTime}ms...`,
        error
      );

      if (retries >= maxRetries) {
        console.error("Máximo de reintentos alcanzado. Abortando...");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

startServer();
