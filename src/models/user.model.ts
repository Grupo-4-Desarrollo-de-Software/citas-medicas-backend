export type UserRole = 'ADMIN' | 'OPERADOR';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: UserRole;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export type PublicUsuario = Omit<Usuario, 'password_hash'>;
