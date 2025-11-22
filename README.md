# Sistema de Reservas Médicas Multicanal – Backend

Backend en Node.js + TypeScript + PostgreSQL para registrar y consultar citas médicas consumido por app Android y panel web.

## Requisitos
- Node.js 20+
- npm 10+
- Docker + Docker Compose v2

## Configuración rápida
1. Clona el repositorio.
2. Crea un archivo `.env` en la raíz (usa `.env.example` si existe) con:
   ```
   DB_HOST=postgres
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=reservas_db
   PORT=3000
   ```
3. Instala dependencias para desarrollo local:
   ```bash
   npm install
   ```

## Ejecutar en modo desarrollo (sin Docker)
```bash
npm run dev
```
El servidor se levanta en `http://localhost:3000` y espera que PostgreSQL esté disponible con los datos del `.env`.

## Ejecutar con Docker Compose
```bash
docker compose up --build
```
- Servicio `postgres`: usa la imagen `postgres:16-alpine`, inicializa la tabla `citas` mediante los SQL en `db/migrations`.
- Servicio `api`: construye la imagen con el `Dockerfile`, compila TypeScript y expone `PORT` (3000 por defecto).

El volumen `postgres_data` guarda los datos; elimina el volumen para reprocesar las migraciones:
```bash
docker compose down -v
```

## Scripts disponibles
- `npm run dev`: recarga en caliente con `ts-node-dev`.
- `npm run build`: compila a `dist/`.
- `npm start`: ejecuta `node dist/index.js`.

## Endpoints principales
```bash
# Health check
curl -i http://localhost:3000/api/health

# Crear cita
curl -i -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{
        "id_paciente": 1,
        "id_medico": 2,
        "fecha": "2024-12-10",
        "hora": "09:30:00",
        "canal": "API"
      }'

# Listar citas
curl -i http://localhost:3000/api/citas

# Obtener cita por ID
curl -i http://localhost:3000/api/citas/1

# Confirmar cita
```bash
curl -i -X POST http://localhost:3000/api/citas/confirmar \
   -H "Content-Type: application/json" \
   -d '{"id_cita": 1 }'
```
```

## Estructura relevante
```
src/
├── index.ts                 # Punto de entrada Express
├── db/
│   ├── pool.ts              # Configuración base del pool
│   └── database.ts          # Helper para queries/transacciones
├── middlewares/
│   └── error.middleware.ts  # Manejo centralizado de errores SQL
├── models/
│   └── cita.model.ts        # Interfaces tipadas
├── routes/
│   └── citas.routes.ts      # Rutas /api/citas
├── controllers/
│   └── citas.controller.ts  # Validación + orquestación
└── services/
    └── citas.service.ts     # Lógica de acceso a datos
db/migrations/
└── 001_create_citas.sql     # Esquema inicial + trigger updated_at
```

## Problemas comunes
- **`ECONNREFUSED`**: la API no alcanza al servicio `postgres`. Verifica que Docker Compose esté arriba y que las credenciales coincidan.
- **`42P01 relation "citas" does not exist`**: borra el volumen `postgres_data` y vuelve a levantar para que corra la migración inicial.
 
## Notas sobre idempotencia y validaciones de horario
- **Idempotencia**: puedes enviar la cabecera `Idempotency-Key` al crear una cita. Si una petición con la misma clave ya fue procesada, la API devolverá la cita creada anteriormente en lugar de crear una nueva.
- **Evitar choques de horario**: al crear una cita la API valida que no exista otra cita para el mismo `id_medico` en la misma `fecha` y `hora` (se excluyen citas con `estado = 'CANCELADO'`). Si hay conflicto, la API responde con `409 Conflict`.

## Envío de SMS (Twilio u otro proveedor)

El backend incluye un módulo de SMS en `src/services/sms.service.ts` que funciona en dos modos:

- Fallback (por defecto): si `SMS_ENABLED` no está en `true` o no se instaló `twilio`, el servicio hace un `console.log` con el contenido del SMS (útil en entornos 2G con gateways externos o en desarrollo).
- Twilio: si instalas `twilio` y configuras las variables de entorno, el servicio usará la API de Twilio para enviar SMS.

Variables de entorno relevantes:
- `SMS_ENABLED=true` — habilita envío de SMS.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` — credenciales y remitente de Twilio.

Uso en endpoints:
- Al crear una cita puedes enviar `telefono` en el body (formato E.164, p. ej. `+519xxxxxxxx`) y, si `SMS_ENABLED=true`, el sistema enviará un SMS confirmando la creación.
- Al confirmar una cita (`POST /api/citas/confirmar`) también puedes incluir `telefono` en el body para recibir un SMS con la confirmación.

Ejemplo crear cita con teléfono:
```bash
curl -i -X POST http://localhost:3000/api/citas \
   -H "Content-Type: application/json" \
   -d '{"id_paciente":1,"id_medico":2,"fecha":"2025-12-10","hora":"09:30:00","canal":"SMS","telefono":"+519XXXXXXXX"}'
```

Si quieres usar Twilio en producción instala la dependencia y configura las env vars:
```cmd
npm install twilio --save
set TWILIO_ACCOUNT_SID=your_sid
set TWILIO_AUTH_TOKEN=your_token
set TWILIO_FROM=+1XXXXXXXXXX
set SMS_ENABLED=true
```



