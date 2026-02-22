import tablesSqlText from "../schema/tables.sql?raw";
import { schemaSpec as appSchemaSpec } from "../schema/schema-spec";
import { createCtxDb } from "./db";
import type { SchemaSpec as AppSchemaSpec } from "../schema/schema-spec";
import type { SchemaSpec as EnsureSchemaSpec, ColumnSpec as EnsureColumnSpec } from "./db/ensureSchema";

function toEnsureSchemaSpec(appSpec: AppSchemaSpec): EnsureSchemaSpec {
  return {
    tables: appSpec.tables.map((table) => ({
      name: table.name,
      required: table.columns.map((column) => ({
        name: column.name,
        type: column.type,
        nullable: column.notNull === true ? false : undefined,
        defaultSql: column.default,
      } as EnsureColumnSpec)),
    })),
  };
}

export const ctxDb = createCtxDb({
  dbName: "fare",
  tablesSqlText,
  schemaSpec: toEnsureSchemaSpec(appSchemaSpec),
  strict: true,
  autoFix: true,
});
