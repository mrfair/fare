// src/schema/schemaSpec.ts
// Optional app-side schema spec.
// Used by core ensureSchema() to validate & safe auto-fix (ADD COLUMN only).
//
// If you don't want to maintain this, you can pass `schemaSpec: undefined` and
// rely on tables.sql creation only (less strict).

export type ColumnSpec = {
  name: string;
  type: string;
  nullable?: boolean;
  defaultSql?: string;
};

export type TableSpec = {
  name: string;
  required: ColumnSpec[];
};

export type SchemaSpec = {
  tables: TableSpec[];
};

// Minimal requirements for sync snapshot strategy
export const schemaSpec: SchemaSpec = {
  tables: [
    {
      name: "meta",
      required: [
        { name: "key", type: "TEXT", nullable: false },
        { name: "value", type: "TEXT", nullable: false },
      ],
    },
    {
      name: "outbox",
      required: [
        { name: "id", type: "TEXT", nullable: false },
        { name: "entity", type: "TEXT", nullable: false },
        { name: "entity_id", type: "TEXT", nullable: false },
        { name: "op", type: "TEXT", nullable: false },
        { name: "hlc", type: "TEXT", nullable: false },
        { name: "sent_at", type: "INTEGER", nullable: true },
        { name: "created_at", type: "INTEGER", nullable: false },
      ],
    },
    {
      name: "schools",
      required: [
        { name: "id", type: "TEXT", nullable: false },
        { name: "name", type: "TEXT", nullable: false },
        { name: "city", type: "TEXT", nullable: true },
        { name: "updated_hlc", type: "TEXT", nullable: false },
        { name: "deleted_hlc", type: "TEXT", nullable: true },
        { name: "updated_by", type: "TEXT", nullable: true },
      ],
    },
  ],
};
