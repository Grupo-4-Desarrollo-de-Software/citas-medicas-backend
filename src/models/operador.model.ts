import { PublicUsuario } from "./user.model";

export interface Operador {
  id_operador: number;
  id_usuario: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OperadorWithUser extends Operador {
  usuario: PublicUsuario;
}

export interface CreateOperadorDTO {
  id_usuario: number;
  activo?: boolean;
}

export interface UpdateOperadorDTO {
  activo?: boolean;
}
