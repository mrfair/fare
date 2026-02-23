// src/app/db/local.ts
// wa-sqlite implementation for fare local DB (persistent IndexedDB)
//
// Install:
//   npm i wa-sqlite
//
// This uses wa-sqlite async build + IDBVersionedVFS (IndexedDB, rollback-journal aware).
// You can swap VFS later (OPFS, etc).

import SQLiteAsyncESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs";
import wasmUrl from "wa-sqlite/dist/wa-sqlite-async.wasm?url";
import * as SQLite from "wa-sqlite";
import { IDBVersionedVFS } from "wa-sqlite/src/examples/IDBVersionedVFS.js";

import type { DbExec, SqlParams } from "./types";

type SQLiteApi = ReturnType<typeof SQLite.Factory>;

let _sqlite3Promise: Promise<SQLiteApi> | null = null;
let _vfsRegistered = new Set<string>();

async function getSqlite3(): Promise<SQLiteApi> {
  if (_sqlite3Promise) return _sqlite3Promise;
  _sqlite3Promise = (async () => {
    const module = await SQLiteAsyncESMFactory({
      locateFile: (path) => (path.endsWith(".wasm") ? wasmUrl : path),
    });
    return SQLite.Factory(module);
  })();
  return _sqlite3Promise;
}

function toBinding(params?: SqlParams): any[] | Record<string, any> | undefined {
  if (!params) return undefined;
  if (Array.isArray(params)) return params;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(params)) {
    out[k.startsWith(":") || k.startsWith("$") || k.startsWith("@") ? k : `:${k}`] = v;
  }
  return out;
}

function rowToObject(row: any[], columns: string[]) {
  const obj: Record<string, any> = {};
  for (let i = 0; i < columns.length; i++) obj[columns[i]] = row[i];
  return obj;
}

async function execAll(sqlite3: SQLiteApi, db: number, sql: string, params?: SqlParams) {
  const results: any[] = [];
  const binding = toBinding(params);

  for await (const stmt of sqlite3.statements(db, sql)) {
    try {
      if (binding) sqlite3.bind_collection(stmt, binding);

      const columns = sqlite3.column_names(stmt);
      while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        const row = sqlite3.row(stmt) as any[];
        results.push(rowToObject(row, columns));
      }
    } finally {
      try {
        await sqlite3.finalize(stmt);
      } catch {
        // ignore double-finalize (some drivers already finalize)
      }
    }
  }
  return results;
}

async function execRun(sqlite3: SQLiteApi, db: number, sql: string, params?: SqlParams) {
  const binding = toBinding(params);

  for await (const stmt of sqlite3.statements(db, sql)) {
    try {
      if (binding) sqlite3.bind_collection(stmt, binding);
      while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
        // ignore rows
      }
    } finally {
      try {
        await sqlite3.finalize(stmt);
      } catch {
        // ignore double-finalize (some drivers already finalize)
      }
    }
  }
  return { changes: sqlite3.changes(db) };
}

function createSerialRunner() {
  let chain: Promise<void> = Promise.resolve();
  return async function runSerialized<T>(fn: () => Promise<T>): Promise<T> {
    const work = chain.then(fn, fn);
    chain = work.then(() => undefined, () => undefined);
    return work;
  };
}

export async function openLocalDb(name = "fare"): Promise<DbExec> {
  const sqlite3 = await getSqlite3();

  // Bump VFS name format so old/corrupted IndexedDB layouts do not poison startup.
  const vfsName = `${name}-idb-v2`;
  if (!_vfsRegistered.has(vfsName)) {
    sqlite3.vfs_register(new IDBVersionedVFS(vfsName, { durability: "relaxed" }));
    _vfsRegistered.add(vfsName);
  }

  const filename = `${name}.sqlite`;
  const db = await sqlite3.open_v2(
    filename,
    SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE,
    vfsName
  );

  // IDBVersionedVFS is rollback-journal aware; keep delete journal semantics.
  await sqlite3.exec(db, "PRAGMA journal_mode=DELETE");
  await sqlite3.exec(db, "PRAGMA synchronous=NORMAL");
  await sqlite3.exec(db, "PRAGMA temp_store=MEMORY");
  const runSerialized = createSerialRunner();

  return {
    exec: async (sql: string) => runSerialized(async () => {
      await sqlite3.exec(db, sql);
    }),
    all: async <T = any>(sql: string, params?: SqlParams) => runSerialized(async () => {
      return (await execAll(sqlite3, db, sql, params)) as T[];
    }),
    get: async <T = any>(sql: string, params?: SqlParams) => runSerialized(async () => {
      const rows = await execAll(sqlite3, db, sql, params);
      return (rows[0] ?? null) as T | null;
    }),
    run: async (sql: string, params?: SqlParams) => runSerialized(async () => {
      return execRun(sqlite3, db, sql, params);
    }),
  };
}
