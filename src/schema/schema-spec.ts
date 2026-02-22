// src/schema/schema-spec.ts
// Source of truth for schema. Generator: tools/gen-schema.ts -> src/schema/tables.sql

export type Column = {
  name: string;
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  default?: string; // SQL literal e.g. "0" or "''"
};

export type Index = { name: string; columns: string[]; unique?: boolean; };

export type Table = { name: string; columns: Column[]; indexes?: Index[]; };

export type SchemaSpec = { tables: Table[]; };

export const schemaSpec: SchemaSpec = {
  tables: [
    {
      name: "meta",
      columns: [
        { name: "key", type: "TEXT", primaryKey: true },
        { name: "value", type: "TEXT", notNull: true },
      ],
    },
    {
      name: "outbox",
      columns: [
        { name: "id", type: "TEXT", primaryKey: true },
        { name: "entity", type: "TEXT", notNull: true },
        { name: "entity_id", type: "TEXT", notNull: true },
        { name: "op", type: "TEXT", notNull: true }, // upsert|delete
        { name: "hlc", type: "TEXT", notNull: true },
        { name: "sent_at", type: "INTEGER" },
        { name: "created_at", type: "INTEGER", notNull: true },
      ],
      indexes: [
        { name: "outbox-sent-idx", columns: ["sent_at"] },
        { name: "outbox-entity-idx", columns: ["entity", "entity_id"] },
      ],
    },
    {
      name: "schools",
      columns: [
        { name: "id", type: "TEXT", primaryKey: true },
        { name: "name", type: "TEXT", notNull: true },
        { name: "city", type: "TEXT" },
        { name: "updated_hlc", type: "TEXT", notNull: true },
        { name: "deleted_hlc", type: "TEXT" },
        { name: "updated_by", type: "TEXT" },
      ],
      indexes: [
        { name: "schools-updated-idx", columns: ["updated_hlc"] },
        { name: "schools-deleted-idx", columns: ["deleted_hlc"] },
      ],
    },
  ],
};
