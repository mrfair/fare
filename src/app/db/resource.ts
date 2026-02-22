// src/app/db/resource.ts
import type { DbExec } from "./types";
import { nextHlc } from "./clock";

export type ListQuery = {
  limit?: number;
  offset?: number;
  orderBy?: string; // e.g. "name ASC"
  where?: Record<string, string | number | null>;
  includeDeleted?: boolean;
};

export type DbResource<T extends { id: string }> = {
  list: (q?: ListQuery) => Promise<T[]>;
  get: (id: string) => Promise<T | null>;
  create: (row: T) => Promise<T>;
  update: (id: string, patch: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
};

function buildWhere(where: Record<string, any> | undefined, params: any[]) {
  if (!where || Object.keys(where).length === 0) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(where)) {
    parts.push(`${k} IS ?`);
    params.push(v);
  }
  return " AND " + parts.join(" AND ");
}

async function enqueueOutbox(db: DbExec, entity: string, entityId: string, op: "upsert" | "delete", hlc: string) {
  const id = crypto.randomUUID();
  await db.run(
    `INSERT INTO outbox(id, entity, entity_id, op, hlc, sent_at, created_at)
     VALUES(?, ?, ?, ?, ?, NULL, ?)`,
    [id, entity, entityId, op, hlc, Date.now()]
  );
}

export function createResource<T extends { id: string }>(
  db: DbExec,
  table: string,
  clientId: string
): DbResource<T> {
  async function list(q: ListQuery = {}) {
    const params: any[] = [];
    const whereSql = buildWhere(q.where, params);
    const deletedSql = q.includeDeleted ? "" : " AND deleted_hlc IS NULL";
    const order = q.orderBy ? ` ORDER BY ${q.orderBy}` : "";
    const limit = q.limit != null ? ` LIMIT ${Number(q.limit)}` : "";
    const offset = q.offset != null ? ` OFFSET ${Number(q.offset)}` : "";

    const sql = `SELECT * FROM ${table} WHERE 1=1${whereSql}${deletedSql}${order}${limit}${offset}`;
    return db.all<T>(sql, params);
  }

  async function get(id: string) {
    return db.get<T>(`SELECT * FROM ${table} WHERE id=? AND deleted_hlc IS NULL`, [id]);
  }

  async function upsertRow(row: any) {
    const hlc = nextHlc(clientId);

    const keys = Object.keys(row);
    const cols = [...keys, "updated_hlc", "deleted_hlc", "updated_by"];
    const placeholders = cols.map(() => "?").join(", ");
    const values = [...keys.map(k => row[k]), hlc, null, clientId];

    const updateSets = cols
      .filter(c => c !== "id")
      .map(c => `${c}=excluded.${c}`)
      .join(", ");

    await db.run(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})
       ON CONFLICT(id) DO UPDATE SET ${updateSets}`,
      values
    );

    await enqueueOutbox(db, table, row.id, "upsert", hlc);

    const out = await db.get<T>(`SELECT * FROM ${table} WHERE id=?`, [row.id]);
    if (!out) throw new Error(`[fare.db] upsert failed: ${table}/${row.id}`);
    return out;
  }

  async function create(row: T) {
    if (!row.id) throw new Error(`[fare.db] create requires id for table "${table}"`);
    return upsertRow(row);
  }

  async function update(id: string, patch: Partial<T>) {
    const hlc = nextHlc(clientId);
    const entries = Object.entries(patch).filter(([k]) => k !== "id");
    const sets = entries.map(([k]) => `${k}=?`);
    const params = entries.map(([,v]) => v);

    sets.push("updated_hlc=?","updated_by=?");
    params.push(hlc, clientId, id);

    await db.run(`UPDATE ${table} SET ${sets.join(", ")} WHERE id=?`, params);
    await enqueueOutbox(db, table, id, "upsert", hlc);

    const out = await db.get<T>(`SELECT * FROM ${table} WHERE id=?`, [id]);
    if (!out) throw new Error(`[fare.db] update failed: ${table}/${id} not found`);
    return out;
  }

  async function remove(id: string) {
    const hlc = nextHlc(clientId);
    await db.run(
      `UPDATE ${table} SET deleted_hlc=?, updated_hlc=?, updated_by=? WHERE id=?`,
      [hlc, hlc, clientId, id]
    );
    await enqueueOutbox(db, table, id, "delete", hlc);
  }

  return { list, get, create, update, remove };
}
