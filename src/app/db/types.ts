// src/app/db/types.ts
export type SqlValue = string | number | null | Uint8Array;
export type SqlParams = Record<string, SqlValue> | SqlValue[];

export type DbExec = {
  exec: (sql: string) => Promise<void>;
  get: <T = any>(sql: string, params?: SqlParams) => Promise<T | null>;
  all: <T = any>(sql: string, params?: SqlParams) => Promise<T[]>;
  run: (sql: string, params?: SqlParams) => Promise<{ changes: number }>;
};
