export interface Sede {
  id_sede: number;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSedeDTO {
  nombre: string;
  direccion?: string;
  telefono?: string;
}

export type UpdateSedeDTO = Partial<CreateSedeDTO>;
