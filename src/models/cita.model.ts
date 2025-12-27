/**
 * Representa una fila de la tabla citas en PostgreSQL.
 */
export interface Cita {
  id_cita: number;
  id_paciente: number;
  id_especialidad?: number | null;
  id_sede?: number | null;
  fecha: string;
  hora: string;
  canal: string;
  estado: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
}

/**
 * Datos requeridos para registrar una cita (sin campos autogenerados).
 */
export interface CreateCitaDTO {
  id_paciente: number;
  id_especialidad: number;
  id_sede: number;
  fecha: string;
  hora: string;
  canal: "API" | "SMS" | "WEB";
  estado?: string;
  telefono?: string; // opcional: número en formato E.164 para enviar SMS
}
