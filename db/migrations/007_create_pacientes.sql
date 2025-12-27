-- Tabla de pacientes para registrar pacientes en el sistema
CREATE TABLE IF NOT EXISTS pacientes (
  id_paciente SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE NULL,
  documento VARCHAR(30) NULL UNIQUE,
  genero VARCHAR(20) NULL CHECK (genero IN ('M', 'F', 'O')),
  direccion TEXT NULL,
  ciudad VARCHAR(100) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_updated_at_pacientes ON pacientes;

CREATE TRIGGER set_updated_at_pacientes
BEFORE UPDATE ON pacientes
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_telefono ON pacientes(telefono);
CREATE INDEX IF NOT EXISTS idx_pacientes_documento ON pacientes(documento);
