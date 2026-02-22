import tablesSqlText from "../schema/tables.sql?raw";
import { schemaSpec } from "../schema/schemaSpec";
import { createCtxDb } from "./db";

export const ctxDb = createCtxDb({
  dbName: "fare",
  tablesSqlText,
  schemaSpec,
  strict: true,
  autoFix: true,
});
