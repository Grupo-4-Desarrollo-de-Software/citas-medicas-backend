-- Tabla para manejar claves de idempotencia y mapearlas a recursos creados.
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  entity VARCHAR(50) NOT NULL,
  resource_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice por entidad para consultas rápidas (opcional)
CREATE INDEX IF NOT EXISTS idx_idempotency_entity ON idempotency_keys(entity);
