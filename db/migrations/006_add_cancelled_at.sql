-- Marca de fecha/hora para cancelaciones de citas
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL;
