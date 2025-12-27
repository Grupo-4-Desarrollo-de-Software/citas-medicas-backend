-- Actualizar tabla citas para agregar especialidad y sede, eliminar medico
ALTER TABLE citas
  DROP CONSTRAINT IF EXISTS citas_id_medico_fkey;

ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS id_especialidad INT REFERENCES especialidades(id_especialidad) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS id_sede INT REFERENCES sedes(id_sede) ON DELETE SET NULL;

ALTER TABLE citas
  DROP COLUMN IF EXISTS id_medico;

-- Crear índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_citas_id_especialidad ON citas(id_especialidad);
CREATE INDEX IF NOT EXISTS idx_citas_id_sede ON citas(id_sede);
CREATE INDEX IF NOT EXISTS idx_citas_id_paciente ON citas(id_paciente);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
