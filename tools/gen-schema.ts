// tools/gen-schema.ts
// Works out-of-the-box with: "gen:schema": "tsx tools/gen-schema.ts"
import { writeFileSync } from "node:fs";
import { schemaSpec } from "../src/schema/schema-spec";

function colSql(c: any) {
  const parts: string[] = [`${c.name} ${c.type}`];
  if (c.primaryKey) parts.push("PRIMARY KEY");
  if (c.notNull) parts.push("NOT NULL");
  if (c.unique) parts.push("UNIQUE");
  if (c.default !== undefined) parts.push(`DEFAULT ${c.default}`);
  return parts.join(" ");
}

function indexSql(t: any, i: any) {
  const uniq = i.unique ? "UNIQUE " : "";
  return `CREATE ${uniq}INDEX IF NOT EXISTS ${i.name} ON ${t.name}(${i.columns.join(", ")});`;
}

let out = `-- GENERATED FILE. DO NOT EDIT.
-- Generated from src/schema/schema-spec.ts
-- Run: npm run gen:schema

`;

for (const t of schemaSpec.tables) {
  out += `CREATE TABLE IF NOT EXISTS ${t.name} (\n`;
  out += t.columns.map((c: any) => `  ${colSql(c)}`).join(",\n");
  out += `\n);\n\n`;
  for (const i of t.indexes ?? []) out += indexSql(t, i) + "\n";
  out += "\n";
}

writeFileSync("src/schema/tables.sql", out, "utf8");
console.log("✅ Generated src/schema/tables.sql");
