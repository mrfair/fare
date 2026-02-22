// src/app/db/index.ts
import type { DbExec } from "./types";
import { openLocalDb } from "./local";
import { ensureSchema, type SchemaSpec } from "./ensureSchema";
import { createResource, type DbResource } from "./resource";

export type CtxDb = (<T extends { id: string } = any>(table: string) => DbResource<T>);

export type CreateCtxDbOptions = {
  dbName?: string;
  clientId?: string;       // stable device id (defaults to localStorage)
  tablesSqlText: string;   // app-provided canonical schema
  schemaSpec?: SchemaSpec; // app-provided spec for validation/auto-fix
  strict?: boolean;
  autoFix?: boolean;
  onWarning?: (msg: string) => void;
};

let _dbPromise: Promise<DbExec> | null = null;
let _ready: Promise<void> | null = null;

export function createCtxDb(opts: CreateCtxDbOptions): CtxDb {
  const clientId = opts.clientId ?? getOrCreateClientId();

  async function getDb() {
    if (!_dbPromise) _dbPromise = openLocalDb(opts.dbName ?? "fare");
    return _dbPromise;
  }

  async function ensureReady() {
    if (_ready) return _ready;
    _ready = (async () => {
      const db = await getDb();
      await ensureSchema(db, {
        tablesSqlText: opts.tablesSqlText,
        schemaSpec: opts.schemaSpec,
        strict: opts.strict ?? true,
        autoFix: opts.autoFix ?? true,
        onWarning: opts.onWarning,
      });

      // store client id (useful for sync later)
      await db.run(
        "INSERT INTO meta(key,value) VALUES('client_id', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        [clientId]
      );
    })();
    return _ready;
  }

  const fn = ((table: string) => {
    // Wrap each call to ensure init, then use a resource bound to the shared db + clientId
    return {
      list: async (q?: any) => { await ensureReady(); return createResource<any>(await getDb(), table, clientId).list(q); },
      get: async (id: string) => { await ensureReady(); return createResource<any>(await getDb(), table, clientId).get(id); },
      create: async (row: any) => { await ensureReady(); return createResource<any>(await getDb(), table, clientId).create(row); },
      update: async (id: string, patch: any) => { await ensureReady(); return createResource<any>(await getDb(), table, clientId).update(id, patch); },
      remove: async (id: string) => { await ensureReady(); return createResource<any>(await getDb(), table, clientId).remove(id); },
    } as DbResource<any>;
  }) as any;

  return fn as CtxDb;
}

function getOrCreateClientId() {
  const key = "fare_client_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}
