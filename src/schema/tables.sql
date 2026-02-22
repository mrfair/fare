-- GENERATED FILE. DO NOT EDIT.
-- Generated from src/schema/schemaSpec.ts
-- Run: npm run gen:schema

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,
  hlc TEXT NOT NULL,
  sent_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS outbox_sent_idx ON outbox(sent_at);
CREATE INDEX IF NOT EXISTS outbox_entity_idx ON outbox(entity, entity_id);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  member_id TEXT NOT NULL,
  updated_hlc TEXT NOT NULL,
  deleted_hlc TEXT,
  updated_by TEXT
);

CREATE INDEX IF NOT EXISTS projects_updated_idx ON projects(updated_hlc);
CREATE INDEX IF NOT EXISTS projects_deleted_idx ON projects(deleted_hlc);

