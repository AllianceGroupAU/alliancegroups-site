-- Additive D1 migration for the inbound AI receptionist.
-- Run only after verifying the target D1 database; no seed rows or destructive DDL.
CREATE TABLE IF NOT EXISTS voice_calls (
  call_id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL UNIQUE REFERENCES leads(id),
  received_ms INTEGER NOT NULL,
  direction TEXT NOT NULL CHECK(direction='inbound')
);
CREATE INDEX IF NOT EXISTS idx_voice_calls_received ON voice_calls(received_ms DESC);
