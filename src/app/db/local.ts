// src/app/db/local.ts
// wa-sqlite implementation for fare local DB (persistent IndexedDB)
//
// Install:
//   npm i wa-sqlite
//
// This uses wa-sqlite async build + IDBBatchAtomicVFS (IndexedDB, atomic batches).
// You can swap VFS later (OPFS, etc).

import SQLiteAsyncESMFactory from "wa-sqlite/dist/wa-sqlite-async.mjs";
import wasmUrl from "wa-sqlite/dist/wa-sqlite-async.wasm?url";
import * as SQLite from "wa-sqlite";
import { IDBBatchAtomicVFS } from "wa-sqlite/src/examples/IDBBatchAtomicVFS.js";

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
    if (binding) sqlite3.bind_collection(stmt, binding);

    const columns = sqlite3.column_names(stmt);
    while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
      const row = sqlite3.row(stmt) as any[];
      results.push(rowToObject(row, columns));
    }
  }
  return results;
}

async function execRun(sqlite3: SQLiteApi, db: number, sql: string, params?: SqlParams) {
  const binding = toBinding(params);

  for await (const stmt of sqlite3.statements(db, sql)) {
    if (binding) sqlite3.bind_collection(stmt, binding);
    while ((await sqlite3.step(stmt)) === SQLite.SQLITE_ROW) {
      // ignore rows
    }
  }
  return { changes: sqlite3.changes(db) };
}

export async function openLocalDb(name = "fare"): Promise<DbExec> {
  const sqlite3 = await getSqlite3();

  const vfsName = `${name}-idb`;
  if (!_vfsRegistered.has(vfsName)) {
    sqlite3.vfs_register(new IDBBatchAtomicVFS(vfsName, { durability: "relaxed" }));
    _vfsRegistered.add(vfsName);
  }

  const filename = `${name}.sqlite`;
  const db = await sqlite3.open_v2(
    filename,
    SQLite.SQLITE_OPEN_CREATE | SQLite.SQLITE_OPEN_READWRITE,
    vfsName
  );

  return {
    exec: async (sql: string) => { await sqlite3.exec(db, sql); },
    all: async <T = any>(sql: string, params?: SqlParams) => (await execAll(sqlite3, db, sql, params)) as T[],
    get: async <T = any>(sql: string, params?: SqlParams) => {
      const rows = await execAll(sqlite3, db, sql, params);
      return (rows[0] ?? null) as T | null;
    },
    run: async (sql: string, params?: SqlParams) => execRun(sqlite3, db, sql, params),
  };
}
