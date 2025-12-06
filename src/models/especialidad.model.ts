export interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEspecialidadDTO {
  nombre: string;
  descripcion?: string;
}

export type UpdateEspecialidadDTO = Partial<CreateEspecialidadDTO>;
