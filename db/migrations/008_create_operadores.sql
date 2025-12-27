-- Tabla de operadores para gestión de citas
-- Los operadores son usuarios del sistema con permisos para crear/modificar citas
CREATE TABLE IF NOT EXISTS operadores (
  id_operador SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_operadores_usuario UNIQUE (id_usuario)
);

DROP TRIGGER IF EXISTS set_updated_at_operadores ON operadores;

CREATE TRIGGER set_updated_at_operadores
BEFORE UPDATE ON operadores
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_operadores_usuario ON operadores(id_usuario);
