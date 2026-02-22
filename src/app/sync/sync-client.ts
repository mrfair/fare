// src/app/sync/sync-client.ts
import type { DbExec } from "../db/types";
import { cmpHlc, maxHlc } from "./hlc";

export type Cursor = { ts: number; id: string };

export type OutboxRow = {
  id: string;
  entity: string;
  entity_id: string;
  op: "upsert" | "delete";
  hlc: string;
  sent_at: number | null;
  created_at: number;
};

export type SyncChange =
  | { id: string; entity: string; op: "upsert"; entityId: string; hlc: string; row: Record<string, any> }
  | { id: string; entity: string; op: "delete"; entityId: string; hlc: string };

export type SyncRequest = {
  clientId: string;
  cursor: Cursor;
  changes: SyncChange[];
};

export type SyncRemoteChange =
  | { id: string; clientId: string; entity: string; entityId: string; op: "upsert"; hlc: string; createdAt: number; row: Record<string, any> }
  | { id: string; clientId: string; entity: string; entityId: string; op: "delete"; hlc: string; createdAt: number };

export type SyncResponse = {
  ack: string[];
  newCursor: Cursor;
  remoteChanges: SyncRemoteChange[];
};

const META_CURSOR_TS = "sync_cursor_ts";
const META_CURSOR_ID = "sync_cursor_id";

export async function getCursor(db: DbExec): Promise<Cursor> {
  const tsRow = await db.get<{ value: string }>("SELECT value FROM meta WHERE key=?", [META_CURSOR_TS]);
  const idRow = await db.get<{ value: string }>("SELECT value FROM meta WHERE key=?", [META_CURSOR_ID]);
  return { ts: Number(tsRow?.value || 0), id: String(idRow?.value || "") };
}

export async function setCursor(db: DbExec, cursor: Cursor): Promise<void> {
  await db.run(
    "INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [META_CURSOR_TS, String(cursor.ts)]
  );
  await db.run(
    "INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [META_CURSOR_ID, String(cursor.id)]
  );
}

export async function hasPendingOutbox(db: DbExec): Promise<boolean> {
  const row = await db.get("SELECT 1 as ok FROM outbox WHERE sent_at IS NULL LIMIT 1");
  return !!row;
}

export async function loadOutboxBatch(db: DbExec, limit = 100): Promise<OutboxRow[]> {
  return db.all<OutboxRow>(
    "SELECT id, entity, entity_id, op, hlc, sent_at, created_at FROM outbox WHERE sent_at IS NULL ORDER BY created_at ASC LIMIT ?",
    [limit]
  );
}

export async function markAckSent(db: DbExec, ackIds: string[]): Promise<void> {
  if (!ackIds.length) return;
  const now = Date.now();
  const chunkSize = 200;
  for (let i = 0; i < ackIds.length; i += chunkSize) {
    const chunk = ackIds.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => "?").join(", ");
    await db.run(`UPDATE outbox SET sent_at=? WHERE id IN (${placeholders})`, [now, ...chunk]);
  }
}

export async function buildChangesFromOutbox(db: DbExec, rows: OutboxRow[]): Promise<SyncChange[]> {
  const changes: SyncChange[] = [];
  for (const r of rows) {
    if (r.op === "delete") {
      changes.push({ id: r.id, entity: r.entity, op: "delete", entityId: r.entity_id, hlc: r.hlc });
      continue;
    }
    const row = await db.get<Record<string, any>>(`SELECT * FROM ${r.entity} WHERE id=?`, [r.entity_id]);
    if (!row) {
      changes.push({ id: r.id, entity: r.entity, op: "delete", entityId: r.entity_id, hlc: r.hlc });
      continue;
    }
    changes.push({ id: r.id, entity: r.entity, op: "upsert", entityId: r.entity_id, hlc: r.hlc, row });
  }
  return changes;
}

export async function applyRemoteChanges(db: DbExec, remote: SyncRemoteChange[]): Promise<void> {
  if (!remote.length) return;

  await db.exec("BEGIN");
  try {
    for (const ch of remote) {
      const table = ch.entity;

      if (ch.op === "upsert") {
        const row = { ...ch.row, id: ch.entityId };

        // client-side LWW guard (optional)
        const local = await db.get<any>(`SELECT updated_hlc, deleted_hlc FROM ${table} WHERE id=?`, [ch.entityId]);
        const localMax = maxHlc(local?.updated_hlc ?? null, local?.deleted_hlc ?? null);
        if (cmpHlc(ch.hlc, localMax) <= 0) continue;

        const cols = Object.keys(row);
        if (!cols.includes("id")) cols.unshift("id");

        const placeholders = cols.map(() => "?").join(", ");
        const updates = cols.filter(c => c !== "id").map(c => `${c}=excluded.${c}`).join(", ");
        const values = cols.map(c => row[c] ?? null);

        await db.run(
          `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})
           ON CONFLICT(id) DO UPDATE SET ${updates}`,
          values
        );
      } else {
        const hlc = ch.hlc;

        const local = await db.get<any>(`SELECT updated_hlc, deleted_hlc FROM ${table} WHERE id=?`, [ch.entityId]);
        const localMax = maxHlc(local?.updated_hlc ?? null, local?.deleted_hlc ?? null);
        if (cmpHlc(hlc, localMax) <= 0) continue;

        const exists = await db.get<any>(`SELECT 1 as ok FROM ${table} WHERE id=?`, [ch.entityId]);
        if (exists) {
          await db.run(`UPDATE ${table} SET deleted_hlc=?, updated_hlc=? WHERE id=?`, [hlc, hlc, ch.entityId]);
        } else {
          await db.run(
            `INSERT INTO ${table}(id, updated_hlc, deleted_hlc) VALUES(?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET deleted_hlc=excluded.deleted_hlc, updated_hlc=excluded.updated_hlc`,
            [ch.entityId, hlc, hlc]
          );
        }
      }
    }
    await db.exec("COMMIT");
  } catch (e) {
    await db.exec("ROLLBACK");
    throw e;
  }
}

export async function postSync(
  endpoint: string,
  payload: SyncRequest,
  getToken?: (() => Promise<string | null> | string | null)
): Promise<SyncResponse> {
  const token = getToken ? await getToken() : null;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`sync failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as SyncResponse;
}
