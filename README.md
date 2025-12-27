# Sistema de Reservas Médicas Multicanal – Backend

Backend en Node.js + TypeScript + PostgreSQL para registrar y consultar citas médicas consumido por app Android y panel web. Soporta registro de citas por **API**, **SMS**, **SMS Conversacional** y **WEB**.

## Características principales

✅ **Multicanal**: Registro de citas por API REST, SMS, SMS Conversacional y WEB
✅ **Flujo conversacional SMS**: Diálogo automático con Twilio para agendar citas
✅ **Gestión de pacientes, operadores y especialidades**
✅ **Control de rol (ADMIN, OPERADOR)**
✅ **Autenticación JWT**
✅ **Documentación Swagger automática**
✅ **Idempotencia en creación de citas**
✅ **Validación de horarios para evitar conflictos**
✅ **Notificaciones por SMS (Twilio)**

## Requisitos
- Node.js 20+
- npm 10+
- Docker + Docker Compose v2

## Configuración rápida
1. Clona el repositorio.
2. Crea un archivo `.env` en la raíz con:
   ```
   DB_HOST=postgres
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=reservas_db
   PORT=3000
   JWT_SECRET=cambia_esto_en_produccion
   SMS_ENABLED=false
   ```
3. Instala dependencias:
   ```bash
   npm install
   ```

## Ejecutar en modo desarrollo
```bash
npm run dev
```
El servidor se levanta en `http://localhost:3000` y la documentación Swagger está disponible en `http://localhost:3000/api-docs`

## Ejecutar con Docker Compose
```bash
docker compose up --build
```

## Documentación Swagger

Accede a la documentación interactiva en: `http://localhost:3000/api-docs`

En Swagger puedes:
- Ver todos los endpoints disponibles
- Probar directamente desde la interfaz
- Ver los esquemas de request/response
- Entender los códigos de estado

## Scripts disponibles
- `npm run dev`: recarga en caliente con `ts-node-dev`.
- `npm run build`: compila a `dist/`.
- `npm start`: ejecuta `node dist/index.js`.

## Endpoints principales

### Health
- `GET /api/health` — estado del servidor

### Autenticación (sin token)
- `POST /api/auth/register` — registrar usuario (ADMIN/OPERADOR)
- `POST /api/auth/login` — obtener JWT token

### Citas (públicas)
- `POST /api/citas` — crear cita (API)
- `POST /api/citas/sms` — crear cita via SMS (crea paciente automáticamente)
- `GET /api/citas` — listar todas las citas
- `GET /api/citas/:id` — obtener cita por ID
- `POST /api/citas/confirmar` — confirmar cita (requiere token)
- `POST /api/citas/cancelar` — cancelar cita (requiere token)

### Pacientes (admin/operador)
- `GET /api/pacientes` — listar pacientes
- `GET /api/pacientes/:id` — obtener paciente
- `POST /api/pacientes` — crear paciente (admin/operador)
- `PUT /api/pacientes/:id` — actualizar paciente (admin/operador)
- `DELETE /api/pacientes/:id` — eliminar paciente (admin)

### Operadores (admin)
- `GET /api/operadores` — listar operadores
- `GET /api/operadores/:id` — obtener operador
- `POST /api/operadores` — crear operador (admin)
- `PUT /api/operadores/:id` — actualizar operador (admin)
- `DELETE /api/operadores/:id` — eliminar operador (admin)

### Sedes (públicas - sin token para GET)
- `GET /api/sedes` — listar sedes (sin token)
- `GET /api/sedes/:id` — obtener sede (sin token)
- `POST /api/sedes` — crear sede (admin)
- `PUT /api/sedes/:id` — actualizar sede (admin)
- `DELETE /api/sedes/:id` — eliminar sede (admin)
- `GET /api/sedes/:id_sede/especialidades` — listar especialidades de una sede (sin token)
- `POST /api/sedes/:id_sede/especialidades/:id_especialidad` — vincular especialidad a sede (admin)
- `DELETE /api/sedes/:id_sede/especialidades/:id_especialidad` — desvincular especialidad (admin)

### Especialidades (públicas - sin token para GET)
- `GET /api/especialidades` — listar especialidades (sin token)
- `GET /api/especialidades/:id` — obtener especialidad (sin token)
- `POST /api/especialidades` — crear especialidad (admin)
- `PUT /api/especialidades/:id` — actualizar especialidad (admin)
- `DELETE /api/especialidades/:id` — eliminar especialidad (admin)

### Métricas (admin)
- `GET /api/metrics/operacion` — métricas de operación (admin)

## Ejemplos de uso

### 1. Registrar usuario y obtener token
```bash
# Registrar como admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin User",
    "email": "admin@example.com",
    "password": "securepassword",
    "rol": "ADMIN"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword"
  }'
# Respuesta: { "user": {...}, "token": "eyJhbGc..." }
```

### 2. Crear especialidad (requiere token ADMIN)
```bash
curl -X POST http://localhost:3000/api/especialidades \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cardiología",
    "descripcion": "Especialidad del corazón"
  }'
```

### 3. Crear sede (requiere token ADMIN)
```bash
curl -X POST http://localhost:3000/api/sedes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Sede Central",
    "direccion": "Av. Principal 123",
    "telefono": "999999999"
  }'
```

### 4. Crear paciente (requiere token ADMIN/OPERADOR)
```bash
curl -X POST http://localhost:3000/api/pacientes \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "telefono": "+51999999999",
    "email": "juan@example.com",
    "documento": "12345678",
    "genero": "M"
  }'
```

### 5. Crear cita (sin token)
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Content-Type: application/json" \
  -d '{
    "id_paciente": 1,
    "id_especialidad": 1,
    "id_sede": 1,
    "fecha": "2025-12-20",
    "hora": "14:30:00",
    "canal": "API"
  }'
```

### 6. Crear cita vía SMS (sin token - crea paciente automáticamente)
```bash
curl -X POST http://localhost:3000/api/citas/sms \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+51999999999",
    "id_especialidad": 1,
    "id_sede": 1,
    "fecha": "2025-12-20",
    "hora": "15:00:00"
  }'
```

### 7. Confirmar cita (requiere token)
```bash
curl -X POST http://localhost:3000/api/citas/confirmar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_cita": 1,
    "telefono": "+51999999999"
  }'
```

## Estructura del proyecto
```
src/
├── index.ts                 # Punto de entrada Express + Swagger
├── swagger.ts               # Configuración de Swagger
├── db/
│   ├── pool.ts              # Configuración del pool PostgreSQL
│   ├── database.ts          # Helper para queries y transacciones
│   └── migrations.ts        # Ejecutor de migraciones SQL
├── middlewares/
│   ├── auth.middleware.ts   # Autenticación JWT y roles
│   └── error.middleware.ts  # Manejo de errores
├── models/
│   ├── cita.model.ts
│   ├── paciente.model.ts
│   ├── operador.model.ts
│   ├── especialidad.model.ts
│   ├── sede.model.ts
│   └── user.model.ts
├── routes/
│   ├── auth.routes.ts
│   ├── citas.routes.ts
│   ├── pacientes.routes.ts
│   ├── operadores.routes.ts
│   ├── especialidades.routes.ts
│   ├── sedes.routes.ts
│   └── metrics.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── citas.controller.ts
│   ├── pacientes.controller.ts
│   ├── operadores.controller.ts
│   ├── especialidades.controller.ts
│   ├── sedes.controller.ts
│   └── metrics.controller.ts
└── services/
    ├── auth.service.ts
    ├── citas.service.ts
    ├── pacientes.service.ts
    ├── operadores.service.ts
    ├── especialidades.service.ts
    ├── sedes.service.ts
    └── sms.service.ts
```

## Migraciones de base de datos

Las migraciones se ejecutan automáticamente al iniciar la aplicación. Se encuentran en `db/migrations/`:

1. `001_create_citas.sql` — tabla de citas
2. `002_create_idempotency.sql` — tabla de claves de idempotencia
3. `003_add_confirmed_at.sql` — columna de confirmación
4. `004_create_usuarios.sql` — tabla de usuarios (ADMIN/OPERADOR)
5. `005_create_sedes_especialidades.sql` — tablas de sedes y especialidades
6. `006_add_cancelled_at.sql` — columna de cancelación
7. `007_create_pacientes.sql` — tabla de pacientes
8. `008_create_operadores.sql` — tabla de operadores
9. `009_update_citas_schema.sql` — actualización de citas (especialidad + sede)

## Control de acceso por rol

| Endpoint | ADMIN | OPERADOR | Anónimo |
|----------|-------|----------|---------|
| POST /api/citas | ✅ | ✅ | ✅ |
| POST /api/citas/sms | ✅ | ✅ | ✅ |
| POST /api/pacientes | ✅ | ✅ | ❌ |
| DELETE /api/pacientes/:id | ✅ | ❌ | ❌ |
| POST /api/operadores | ✅ | ❌ | ❌ |
| POST /api/especialidades | ✅ | ❌ | ❌ |
| POST /api/sedes | ✅ | ❌ | ❌ |

## Notificaciones por SMS

El sistema puede enviar SMS de notificación al crear o confirmar citas usando **Twilio**.

### Configuración

1. Instala la dependencia (opcional, ya incluida en devDependencies):
   ```bash
   npm install twilio
   ```

2. Configura las variables de entorno en `.env`:
   ```
   SMS_ENABLED=true
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_FROM=+1XXXXXXXXXX
   ```

3. Al crear una cita, incluye el campo `telefono` en E.164:
   ```json
   {
     "id_paciente": 1,
     "id_especialidad": 1,
     "id_sede": 1,
     "fecha": "2025-12-20",
     "hora": "14:30:00",
     "canal": "API",
     "telefono": "+51999999999"
   }
   ```

### Modos de funcionamiento

- **Fallback (por defecto)**: Si `SMS_ENABLED` no está en `true` o no está instalado Twilio, el sistema solo hace `console.log` del SMS (útil para desarrollo).
- **Twilio**: Si está configurado, envía SMS reales mediante la API de Twilio.

## Problemas comunes

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` | Verifica que PostgreSQL esté levantado (`docker compose up`) |
| `42P01 relation "citas" does not exist` | Borra el volumen `docker compose down -v` y reinicia |
| `401 Token no proporcionado` | Incluye el header `Authorization: Bearer <token>` |
| `409 Conflict` | Ya existe una cita en la misma especialidad/sede/fecha/hora |

## Variables de entorno

```env
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=reservas_db

# Servidor
PORT=3000
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRES_IN=8h

# SMS (opcional)
SMS_ENABLED=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
```
