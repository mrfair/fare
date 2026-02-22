// src/app/db/ensureSchema.ts
import type { DbExec } from "./types";

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

export type EnsureSchemaOptions = {
  tablesSqlText: string;
  schemaSpec?: SchemaSpec; // optional app-provided spec
  strict?: boolean;        // dev: true
  autoFix?: boolean;       // dev: true
  onWarning?: (msg: string) => void;
};

async function tableExists(db: DbExec, name: string) {
  const row = await db.get<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    [name]
  );
  return !!row;
}

async function columnsOf(db: DbExec, table: string) {
  const rows = await db.all<{ name: string; type: string; notnull: number }>(
    `PRAGMA table_info(${table})`
  );
  const map = new Map<string, { type: string; notnull: boolean }>();
  for (const r of rows) map.set(r.name, { type: r.type, notnull: !!r.notnull });
  return map;
}

function colDefSql(col: { name: string; type: string; nullable?: boolean; defaultSql?: string }) {
  const nullable = col.nullable ?? true;
  const nn = nullable ? "" : " NOT NULL";
  const d = col.defaultSql ? ` ${col.defaultSql}` : "";
  return `${col.name} ${col.type}${nn}${d}`;
}

export async function ensureSchema(db: DbExec, opts: EnsureSchemaOptions) {
  const strict = opts.strict ?? true;
  const autoFix = opts.autoFix ?? true;
  const warn = opts.onWarning ?? ((m) => console.warn(m));

  // 1) Apply canonical app tables.sql (idempotent)
  await db.exec(opts.tablesSqlText);

  // If no schema spec provided, stop here (creation-only mode)
  if (!opts.schemaSpec) return;

  // 2) Validate + safe auto-fix (ADD COLUMN only)
  for (const t of opts.schemaSpec.tables) {
    const exists = await tableExists(db, t.name);
    if (!exists) {
      const msg = `[fare.db] Missing required table "${t.name}".`;
      if (!autoFix) {
        if (strict) throw new Error(msg);
        warn(msg);
        continue;
      }
      // Rely on tables.sql; try again.
      await db.exec(opts.tablesSqlText);
      const exists2 = await tableExists(db, t.name);
      if (!exists2) throw new Error(`${msg} (tables.sql did not create it)`);
    }

    const cols = await columnsOf(db, t.name);
    for (const req of t.required) {
      if (cols.has(req.name)) continue;

      const msg = `[fare.db] Table "${t.name}" missing column "${req.name}".`;
      if (!autoFix) {
        if (strict) throw new Error(msg);
        warn(msg);
        continue;
      }

      const sql = `ALTER TABLE ${t.name} ADD COLUMN ${colDefSql(req)};`;
      warn(`${msg} Auto-fixing with: ${sql}`);
      await db.exec(sql);
    }
  }
}
