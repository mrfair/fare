-- src/schema/tables.sql
-- Canonical app schema (idempotent). Safe to run every startup.

-- System tables for sync (still app-owned, because they depend on your sync strategy)
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox (
  id         TEXT PRIMARY KEY,
  entity     TEXT NOT NULL,
  entity_id  TEXT NOT NULL,
  op         TEXT NOT NULL, -- 'upsert' | 'delete'
  hlc        TEXT NOT NULL,
  sent_at    INTEGER NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS outbox_sent_idx ON outbox(sent_at);
CREATE INDEX IF NOT EXISTS outbox_entity_idx ON outbox(entity, entity_id);

-- Example snapshot table (no JSON)
CREATE TABLE IF NOT EXISTS schools (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  city        TEXT NULL,

  updated_hlc TEXT NOT NULL,
  deleted_hlc TEXT NULL,
  updated_by  TEXT NULL
);

CREATE INDEX IF NOT EXISTS schools_updated_idx ON schools(updated_hlc);
CREATE INDEX IF NOT EXISTS schools_deleted_idx ON schools(deleted_hlc);
