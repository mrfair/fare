# fare: core DB runtime + app schema + app query catalog (split)

This file explains how the `src/app/db` runtime is organized, what apps must supply, and how to wire the pieces together so that every route can grab `ctx.db(name)` with confidence.

## What lives inside `src/app/db`

### `index.ts`
- Entry point is `createCtxDb(...)`. It lazily opens the wa-sqlite-backed DB (`openLocalDb`), applies the canonical `tables.sql`, and runs `ensureSchema`. The returned `CtxDb` function wraps each table name in a `DbResource` so CRUD helpers share a single `DbExec`, emit HLC timestamps, and push audit rows to `outbox`. `createCtxDb` also persists a stable `client_id` inside the `meta` table (so sync engines can later tie ops to a device).
- Options include `tablesSqlText`, optional `schemaSpec`, and the dev-friendly `strict`/`autoFix` flags that default to `true`.

### `ensureSchema.ts`
- Applies the idempotent `tablesSqlText`, then optionally validates against `SchemaSpec` (tables + required columns). When a table or column is missing it either throws, warns, or (if `autoFix`) safely `ALTER TABLE` adds columns, always logging what it is doing (`onWarning` hook). Strict validation is the default.

### `local.ts`
- Implements `DbExec` on top of `wa-sqlite` + `IDBBatchAtomicVFS`. `openLocalDb(name)` registers an IndexedDB-backed VFS and returns helpers for `exec`, `run`, `get`, and `all`. Binding helpers normalize named parameters so the rest of the runtime can just pass objects or arrays.

### `resource.ts`
- `createResource(table, clientId)` exposes `list`, `get`, `create`, `update`, and `remove`. `list` respects `where`, pagination, ordering, and skips rows with `deleted_hlc`. `create`/`update`/`remove` all:
  - generate a deterministic `hlc` with `nextHlc(clientId)` (see `clock.ts`),
  - write a row into the `outbox` table (`entity`, `entity_id`, op, `hlc`, timestamps) for later sync,
  - store the `updated_by/updated_hlc/deleted_hlc` metadata.
- `create` and `update` upsert via `INSERT ... ON CONFLICT(id)` so authors don't need separate queries.

### `clock.ts` & `types.ts`
- `clock.ts` exposes `nextHlc(clientId)` which returns `<ms>-<counter>-<clientId>` for deterministic conflict resolution.
- `types.ts` defines `DbExec`, `SqlParams`, and `SqlValue` so the runtime and any tests agree on the minimal SQLite contract.

## What the app layer must supply

- `src/schema/tables.sql` — canonical schema for the app, including `meta`, `outbox`, and every app table with `id`, `created_at`, `updated_hlc`, `deleted_hlc`, `updated_by`, etc. This SQL is executed before schema validation.
- `src/schema/schemaSpec.ts` (optional but recommended) — a `SchemaSpec` object that lists every required table and column so `ensureSchema` can guard against drift and `autoFix` missing columns without truncating data.
- `src/queries/*` — keep the entire query catalog in one place so every query is visible to teams.

## Wiring the DB in your entry point

Load the schema, provide the spec, and create the shared `ctxDb` once (e.g. `src/app/ctxDb.ts`):

```ts
import tablesSqlText from "../schema/tables.sql?raw";
import { schemaSpec } from "../schema/schemaSpec";
import { createCtxDb } from "../app/db";

export const ctxDb = createCtxDb({
  dbName: "fare",
  tablesSqlText,
  schemaSpec,
  strict: true,
  autoFix: true,
});
```

Then add `ctx.db` to the router context so every handler can do:

```ts
const schools = ctx.db("schools");
await schools.list();
await schools.create({ id: "s1", name: "ABC", city: "Bangkok" });
```

## Queries belong to the app

Keep query definitions (and especially ones that read from multiple tables) in `src/queries/index.ts` or sibling files. That way teams can audit what the app reads/writes even though the runtime stays framework-only.

---

Notes:
- The runtime assumes snapshot tables with sync metadata (`updated_hlc`, `deleted_hlc`) and an `outbox` table; extend `tables.sql` with whatever your sync engine needs.
- No sync engine is included here yet—`outbox` rows are ready for you to implement pull/push later.
