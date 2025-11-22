-- Añade columna confirmed_at para registrar cuándo se confirmó una cita
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ NULL;
