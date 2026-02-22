// src/app/sync/install-sync.ts
import type { CtxDb } from "../db";
import { openLocalDb } from "../db/local";
import { fareEnv } from "../fare-env";
import {
  applyRemoteChanges,
  buildChangesFromOutbox,
  getCursor,
  hasPendingOutbox,
  loadOutboxBatch,
  markAckSent,
  postSync,
  setCursor,
} from "./sync-client";

type InstallSyncArgs = {
  db: CtxDb; // kept for compatibility; sync opens the same dbName internally
  endpoint: string;
  getAuthToken?: () => Promise<string | null> | string | null;
  intervalMs?: number; // default 10s
  batchSize?: number;  // default 100
};

let started = false;

export function installSync(args: InstallSyncArgs) {
  if (started) return;
  started = true;

  const endpoint = args.endpoint;
  const getToken = args.getAuthToken;
  const intervalMs = args.intervalMs ?? 10_000;
  const batchSize = args.batchSize ?? 100;

  let inFlight = false;
  let backoffMs = 0;
  let timer: any = null;

  async function getDb() {
    return openLocalDb(fareEnv.dbName);
  }

  async function syncOnce(reason: string) {
    if (inFlight) return;
    inFlight = true;

    try {
      const db = await getDb();

      const cursor = await getCursor(db);

      let changes: any[] = [];
      if (await hasPendingOutbox(db)) {
        const outbox = await loadOutboxBatch(db, batchSize);
        changes = await buildChangesFromOutbox(db, outbox);
      }

      const clientId = localStorage.getItem("fare_client_id") || "unknown";
      const res = await postSync(endpoint, { clientId, cursor, changes }, getToken);

      await markAckSent(db, res.ack || []);
      await applyRemoteChanges(db, res.remoteChanges || []);
      await setCursor(db, res.newCursor);

      backoffMs = 0;

      // If more pending, run again quickly
      if (await hasPendingOutbox(db)) schedule("more-pending", 250);
    } catch (e: any) {
      backoffMs = backoffMs ? Math.min(backoffMs * 2, 30_000) : 1_000;
      console.warn("[fare.sync] error:", e?.message || e, "next retry in", backoffMs, "ms");
      schedule("backoff", backoffMs);
    } finally {
      inFlight = false;
    }
  }

  function schedule(reason: string, delayMs: number) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => syncOnce(reason), delayMs);
  }

  // initial run
  schedule("initial", 400);

  // online trigger
  window.addEventListener("online", () => schedule("online", 200));

  // interval safety net (only does work when outbox pending or remote has deltas)
  setInterval(() => schedule("interval", 0), intervalMs);

  console.info("[fare.sync] started", { endpoint, intervalMs, batchSize, dbName: fareEnv.dbName });
}
