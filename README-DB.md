# fare: core DB runtime + app schema + app query catalog (split)

You asked for:
- DB runtime can be in **core**
- `tables.sql` and query catalog should **NOT** be in core

This starter shows a clean split:

## What goes where

### ✅ Core (framework/runtime)
Put these in your **fare core** repo:

- `src/app/db/*`
  - wa-sqlite open (persistent IndexedDB)
  - `createCtxDb()` -> returns callable `ctx.db(name)`
  - schema engine `ensureSchema()` (apply + validate + safe auto-fix)
  - no knowledge of app tables

### ✅ App (project using fare)
Put these in the **app layer** (not core):

- `src/schema/tables.sql`  (canonical app schema; idempotent)
- `src/schema/schemaSpec.ts` (optional; declares required tables/columns for validation/auto-fix)
- `src/queries/*` (query catalog; you can list all queries in one place)

## How to wire it

In your app entry (or router init), load tables.sql and create ctx.db once:

```ts
import tablesSqlText from "../schema/tables.sql?raw";
import { schemaSpec } from "../schema/schemaSpec";
import { createCtxDb } from "../app/db";

export const ctxDb = createCtxDb({
  dbName: "fare",
  tablesSqlText,
  schemaSpec,     // optional but recommended for strict validation + safe auto-fix
  strict: true,
  autoFix: true,
});
```

Then inject into `ctx` in router (see `patch/router.patch.txt`). In the `fare` app we now export `ctxDb` from `src/app/ctxDb.ts` and `makeCtxBase` adds `db: ctxDb`, so every route receives `ctx.db(tableName)` alongside the API client.

## Using ctx.db(name)

```ts
const schools = ctx.db("schools");
await schools.list();
await schools.create({ id: "s1", name: "ABC", city: "Bangkok" });
```

## Queries (not core)
All queries should be registered in `src/queries/index.ts` so teams can see what exists.

---

Notes:
- This uses snapshot tables with sync metadata columns (no JSON).
- Sync engine is not included here (as you requested). You can add internal sync later.
