-- Catálogo de sedes y especialidades médicas
CREATE TABLE IF NOT EXISTS sedes (
  id_sede SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion TEXT NULL,
  telefono VARCHAR(30) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_sedes_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS especialidades (
  id_especialidad SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_especialidades_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS sede_especialidad (
  id_sede INT NOT NULL REFERENCES sedes(id_sede) ON DELETE CASCADE,
  id_especialidad INT NOT NULL REFERENCES especialidades(id_especialidad) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_sede, id_especialidad)
);

-- Triggers updated_at
DROP TRIGGER IF EXISTS set_updated_at_sedes ON sedes;
DROP TRIGGER IF EXISTS set_updated_at_especialidades ON especialidades;

CREATE TRIGGER set_updated_at_sedes
BEFORE UPDATE ON sedes
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();

CREATE TRIGGER set_updated_at_especialidades
BEFORE UPDATE ON especialidades
FOR EACH ROW
EXECUTE FUNCTION trg_set_updated_at();
