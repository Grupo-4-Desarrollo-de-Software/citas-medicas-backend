export interface Paciente {
  id_paciente: number;
  nombre: string;
  email?: string | null;
  telefono: string;
  fecha_nacimiento?: string | null;
  documento?: string | null;
  genero?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePacienteDTO {
  nombre: string;
  email?: string;
  telefono: string;
  fecha_nacimiento?: string;
  documento?: string;
  genero?: string;
  direccion?: string;
  ciudad?: string;
}

export interface UpdatePacienteDTO {
  nombre?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  documento?: string;
  genero?: string;
  direccion?: string;
  ciudad?: string;
}
