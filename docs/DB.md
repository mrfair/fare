# Database runtime (src/app/db)

This documents the runtime that lives inside `src/app/db`, the helpers every fare app injects via `ctx.db(name)`, and the complementary app-level artifacts (`src/schema`, `src/queries`) that ship with your project.

## Runtime components

### `index.ts`
- `createCtxDb` lazily opens the IndexedDB-backed wa-sqlite database (`openLocalDb(name)`), runs `ensureSchema`, and returns a `CtxDb` factory so every route can call `ctx.db("foo")`.
- Stored `clientId` (either provided or minted via `localStorage`) drives HLCs and outbox work. Options include `tablesSqlText`, an optional `SchemaSpec`, and the dev-friendly `strict`/`autoFix` flags (both default `true`).
- Each `CtxDb` call returns a `DbResource` with CRUD helpers bound to the shared `DbExec`, ensuring metadata columns (`updated_hlc`, `updated_by`, `deleted_hlc`) and outbox rows stay consistent.

### `ensureSchema.ts`
- First executes the canonical `tablesSqlText` provided by the app (idempotent SQL).
- If the app passes `schemaSpec`, the runtime validates tables + required columns. Missing tables or columns either throw (strict), warn, or `ALTER TABLE ... ADD COLUMN` (autoFix) while logging via `onWarning`.

### `local.ts`
- Implements the `DbExec` contract using `wa-sqlite` + `IDBBatchAtomicVFS`. `openLocalDb` registers the VFS, opens the database file, and exposes `exec`, `all`, `get`, `run` helpers with normalized bindings so the rest of the runtime stays agnostic to parameter style.

### `resource.ts`
- `createResource(table, clientId)` exposes `list`, `get`, `create`, `update`, and `remove`.
- Queries respect filters, pagination, ordering, and skip rows where `deleted_hlc` is set.
- Mutation helpers generate HLCs via `nextHlc(clientId)` (`clock.ts`), upsert metadata columns, and enqueue audit rows into the `outbox` table so a sync engine can later read changes. `create`/`update` rely on `INSERT ... ON CONFLICT` to simplify upserts.

### `clock.ts` & `types.ts`
- `clock.ts` builds sortable HLC strings (`<ms>-<counter>-<clientId>`) for determinism.
- `types.ts` defines `DbExec`, `SqlParams`, and `SqlValue`, giving the runtime a minimal SQLite surface to work with.

## App responsibilities

- `src/schema/tables.sql` must declare `meta`, `outbox`, and every application table with `id`, metadata columns (`created_at`, `updated_hlc`, `deleted_hlc`, `updated_by`, etc.). This SQL is executed before schema validation so the schema engine can always rely on canonical DDL.
- `src/schema/schemaSpec.ts` (optional but recommended) exports a `SchemaSpec` describing each required table and column so `ensureSchema` can detect drift safely.
- `src/queries/*` is where the application keeps its query catalog, making it easier for teams to audit what read/write operations exist outside the runtime.

## Wiring the shared DB

Create the singleton in `src/app/ctxDb.ts` (or another entry point) and pass it into your router context:

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

Every handler can then do:

```ts
const schools = ctx.db("schools");
await schools.list();
await schools.create({ id: "s1", name: "ABC", city: "Bangkok" });
```

## Queries stay in the app

Keep all queries in `src/queries/index.ts` or sibling files. That way the runtime stays framework-only while the app layer exposes exactly which queries it issues.

---

Notes:
- The runtime assumes snapshot tables with sync metadata (`updated_hlc`, `deleted_hlc`) and an `outbox` table; extend `tables.sql` with whatever your sync engine requires.
- Sync itself is not part of this doc—`outbox` rows are ready for you to implement pull/push later.
