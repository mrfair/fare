// src/schema/schemaSpec.ts
// SINGLE SOURCE OF TRUTH (do not hand-edit tables.sql).
// The generator reads this file and produces src/schema/tables.sql (idempotent).

export type Column = {
  name: string;
  type: "TEXT" | "INTEGER" | "REAL" | "BLOB";
  primaryKey?: boolean;
  notNull?: boolean;
  unique?: boolean;
  default?: string; // SQL literal e.g. "0" or "''"
};

export type Index = {
  name: string;
  columns: string[];
  unique?: boolean;
};

export type Table = {
  name: string;
  columns: Column[];
  indexes?: Index[];
};

export type SchemaSpec = {
  tables: Table[];
};

// Example schema (edit freely)
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
        { name: "op", type: "TEXT", notNull: true },
        { name: "hlc", type: "TEXT", notNull: true },
        { name: "sent_at", type: "INTEGER" },
        { name: "created_at", type: "INTEGER", notNull: true },
      ],
      indexes: [
        { name: "outbox_sent_idx", columns: ["sent_at"] },
        { name: "outbox_entity_idx", columns: ["entity", "entity_id"] },
      ],
    },
    {
      name: "schools",
      columns: [
        // business
        { name: "id", type: "TEXT", primaryKey: true },
        { name: "name", type: "TEXT", notNull: true },
        { name: "city", type: "TEXT" },

        // sync metadata
        { name: "updated_hlc", type: "TEXT", notNull: true },
        { name: "deleted_hlc", type: "TEXT" },
        { name: "updated_by", type: "TEXT" },
      ],
      indexes: [
        { name: "schools_updated_idx", columns: ["updated_hlc"] },
        { name: "schools_deleted_idx", columns: ["deleted_hlc"] },
      ],
    },
  ],
};
