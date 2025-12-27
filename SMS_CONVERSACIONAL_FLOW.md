# Flujo de Citas Conversacional por SMS - Documentación

## 📋 Descripción General

Se ha implementado un **flujo conversacional automático con Twilio** que permite a los **OPERADOREs** agendar citas para pacientes a través de SMS. El sistema maneja un diálogo en varios pasos, recopila información y valida disponibilidad de horarios.

## 🔄 Flujo de Conversación

### Paso 1: Esperar DNI del Paciente
**Estado:** `AWAITING_DNI`

El OPERADOR envía:
```
AGENDAR,12345678
```

Formato: `AGENDAR,{DNI}`

**Respuesta del sistema:**
- ✅ Si el paciente existe: "DNI encontrado. Por favor responde con: ESPECIALIDAD,SEDE (ej: 1,1)"
- ❌ Si no existe: "Paciente no encontrado con ese DNI."

### Paso 2: Seleccionar Especialidad y Sede
**Estado:** `SHOWING_SLOTS`

El OPERADOR envía:
```
1,1
```

Formato: `{ID_ESPECIALIDAD},{ID_SEDE}`

**Respuesta del sistema:**
```
Horarios disponibles:
1. 2025-12-28 a las 09:00
2. 2025-12-28 a las 09:30
3. 2025-12-28 a las 10:00
...
10. 2025-12-29 a las 14:30

Responde con el número del horario seleccionado
```

### Paso 3: Confirmar Horario Seleccionado
**Estado:** `CONFIRMING`

El OPERADOR envía:
```
3
```

**Respuesta del sistema:**
```
✅ Cita confirmada!
Fecha: 2025-12-28
Hora: 10:00
ID Cita: 45
```

## 🛠️ Componentes Técnicos

### 1. **Base de Datos**
**Tabla:** `sms_conversations`

```sql
CREATE TABLE sms_conversations (
  id_conversation SERIAL PRIMARY KEY,
  phone_number VARCHAR(20),
  estado VARCHAR(50),  -- AWAITING_DNI, SHOWING_SLOTS, CONFIRMING, COMPLETED
  dni VARCHAR(15),
  id_paciente INT,
  id_especialidad INT,
  id_sede INT,
  horarios_disponibles JSONB,  -- Array de horarios
  horario_seleccionado INT,
  id_cita INT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ  -- Conversación expira después de 24 horas
);
```

### 2. **Modelos**
- `SmsConversation` - Representa el estado de una conversación
- `HorarioDisponible` - Objeto para cada horario disponible

### 3. **Servicios**
**Archivo:** `src/services/sms-conversation.service.ts`

Funciones principales:
- `getOrCreateConversation(phoneNumber)` - Obtiene o crea conversación activa
- `getConversationById(id)` - Obtiene conversación por ID
- `updateConversation(id, dto)` - Actualiza estado de conversación
- `getDisponibleSlots(idEspecialidad, idSede)` - Obtiene 10 próximos horarios disponibles
- `cleanupExpiredConversations()` - Limpia conversaciones expiradas

### 4. **Controlador**
**Archivo:** `src/controllers/sms.controller.ts`

Función:
- `handleSmsWebhook(req, res, next)` - Procesa SMS entrantes desde Twilio

### 5. **Ruta**
**Endpoint:** `POST /api/sms/webhook`

**Parámetros (form-urlencoded):**
```
From=+51999999999
Body=AGENDAR,12345678
```

## 🔗 Integración con Twilio

### Configuración requerida

En el `.env`:
```env
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=...
```

### Webhook en Twilio Console

1. Ir a Twilio Console → Phone Numbers → Active Numbers
2. Seleccionar el número
3. En "Messaging" → "A Message Comes In"
4. Seleccionar "Webhook"
5. Ingresar URL:
```
https://tu-dominio.com/api/sms/webhook
```
6. Método: `POST`
7. Guardar

## 📊 Arquitectura del Flujo

```
OPERADOR
   ↓
SMS envía AGENDAR,DNI
   ↓
Webhook recibe en /api/sms/webhook
   ↓
Sistema busca conversación por teléfono
   ↓
Estado = AWAITING_DNI?
   ├─ SÍ: Buscar paciente por DNI
   │  ├─ Encontrado: Pasar a SHOWING_SLOTS, responder "DNI encontrado..."
   │  └─ No encontrado: Responder "Paciente no encontrado"
   │
   └─ NO
      ├─ Estado = SHOWING_SLOTS?
      │  ├─ SÍ: Validar ESPECIALIDAD,SEDE, obtener horarios, pasar a CONFIRMING
      │  └─ NO
      │     └─ Estado = CONFIRMING?
      │        ├─ SÍ: Validar horario, crear CITA, pasar a COMPLETED
      │        └─ NO: Error
```

## 🔐 Validaciones

El sistema valida:
- ✅ Formato correcto de mensajes
- ✅ Existencia del paciente por DNI
- ✅ Existencia de especialidad y sede
- ✅ Disponibilidad real de horarios
- ✅ Selección válida de horario
- ✅ Conversaciones expiradas (24 horas)

## 📝 Ejemplo Completo

### SMS 1 - OPERADOR:
```
AGENDAR,12345678
```

### Respuesta del sistema:
```
DNI encontrado. Por favor responde con: ESPECIALIDAD,SEDE (ej: 1,1)
```

### SMS 2 - OPERADOR:
```
1,1
```

### Respuesta del sistema:
```
Horarios disponibles:
1. 2025-12-28 a las 09:00
2. 2025-12-28 a las 09:30
3. 2025-12-28 a las 10:00
4. 2025-12-28 a las 10:30
5. 2025-12-28 a las 11:00
6. 2025-12-28 a las 11:30
7. 2025-12-28 a las 14:00
8. 2025-12-28 a las 14:30
9. 2025-12-28 a las 15:00
10. 2025-12-29 a las 09:00

Responde con el número del horario seleccionado
```

### SMS 3 - OPERADOR:
```
3
```

### Respuesta del sistema:
```
✅ Cita confirmada!
Fecha: 2025-12-28
Hora: 10:00
ID Cita: 45
```

## 🗄️ Base de Datos - Estado guardado

Después del flujo completo:

**Tabla `sms_conversations`:**
```json
{
  "id_conversation": 1,
  "phone_number": "+51999999999",
  "estado": "COMPLETED",
  "dni": "12345678",
  "id_paciente": 5,
  "id_especialidad": 1,
  "id_sede": 1,
  "horarios_disponibles": [
    { "numero": 1, "fecha": "2025-12-28", "hora": "09:00", "disponibilidad": true },
    ...
  ],
  "horario_seleccionado": 3,
  "id_cita": 45,
  "created_at": "2025-12-27T...",
  "updated_at": "2025-12-27T...",
  "expires_at": "2025-12-28T..."
}
```

**Tabla `citas`:**
```json
{
  "id_cita": 45,
  "id_paciente": 5,
  "id_especialidad": 1,
  "id_sede": 1,
  "fecha": "2025-12-28",
  "hora": "10:00",
  "canal": "SMS_CONVERSACIONAL",
  "estado": "PENDIENTE",
  "confirmed_at": null,
  "cancelled_at": null,
  "created_at": "2025-12-27T...",
  "updated_at": "2025-12-27T..."
}
```

## 🚀 Ventajas

✅ **Automático:** Sin intervención de operadores humanos
✅ **Escalable:** Maneja múltiples conversaciones simultáneamente
✅ **Validado:** Verifica cada paso del flujo
✅ **Persistente:** Guarda toda la conversación y la cita en BD
✅ **Expirable:** Las conversaciones se limpian después de 24 horas
✅ **Seguro:** Valida existencia de pacientes, especialidades y horarios

## 🔧 Próximas mejoras posibles

- Permitir enviar SMS con "CANCELAR" para abortar el flujo
- Enviar recordatorios SMS 24h antes de la cita
- Permitir seleccionar múltiples especialidades
- Lenguaje natural o reconocimiento de voz
- Integración con calendarios de profesionales
- Manejo de errores de red/reintentos automáticos

## 📞 Contacto para preguntas

Para preguntas sobre la implementación, revisar:
- `src/controllers/sms.controller.ts`
- `src/services/sms-conversation.service.ts`
- `db/migrations/010_create_sms_conversations.sql`
