import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Sistema de Citas Médicas",
      version: "1.0.0",
      description:
        "Backend para el sistema de reservas de citas médicas multicanal (API, SMS, WEB)",
      contact: {
        name: "UNMSM",
        url: "https://github.com/UNMSM-MASTER/citas-medicas-backend",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de desarrollo",
      },
      {
        url: "/api",
        description: "Servidor productivo",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id_usuario: { type: "number" },
            nombre: { type: "string" },
            email: { type: "string" },
            rol: { type: "string", enum: ["ADMIN", "OPERADOR"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Paciente: {
          type: "object",
          properties: {
            id_paciente: { type: "number" },
            nombre: { type: "string" },
            email: { type: "string", nullable: true },
            telefono: { type: "string" },
            fecha_nacimiento: {
              type: "string",
              format: "date",
              nullable: true,
            },
            documento: { type: "string", nullable: true },
            genero: { type: "string", enum: ["M", "F", "O"], nullable: true },
            direccion: { type: "string", nullable: true },
            ciudad: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Sede: {
          type: "object",
          properties: {
            id_sede: { type: "number" },
            nombre: { type: "string" },
            direccion: { type: "string", nullable: true },
            telefono: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Especialidad: {
          type: "object",
          properties: {
            id_especialidad: { type: "number" },
            nombre: { type: "string" },
            descripcion: { type: "string", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Cita: {
          type: "object",
          properties: {
            id_cita: { type: "number" },
            id_paciente: { type: "number" },
            id_especialidad: { type: "number", nullable: true },
            id_sede: { type: "number", nullable: true },
            fecha: { type: "string", format: "date" },
            hora: { type: "string", format: "time" },
            canal: { type: "string", enum: ["API", "SMS", "WEB"] },
            estado: { type: "string" },
            confirmed_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            cancelled_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Operador: {
          type: "object",
          properties: {
            id_operador: { type: "number" },
            id_usuario: { type: "number" },
            activo: { type: "boolean" },
            usuario: { $ref: "#/components/schemas/Usuario" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.routes.ts"],
};

export const specs = swaggerJsdoc(options);
