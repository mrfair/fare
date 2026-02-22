// src/app/sync/hlc.ts
export function parseHlc(hlc: string) {
  const parts = hlc.split("-");
  const ms = Number(parts[0] || 0);
  const counter = Number(parts[1] || 0);
  const clientId = parts.slice(2).join("-") || "";
  return { ms, counter, clientId };
}

export function cmpHlc(a?: string | null, b?: string | null): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const pa = parseHlc(a);
  const pb = parseHlc(b);

  if (pa.ms !== pb.ms) return pa.ms < pb.ms ? -1 : 1;
  if (pa.counter !== pb.counter) return pa.counter < pb.counter ? -1 : 1;
  if (pa.clientId === pb.clientId) return 0;
  return pa.clientId < pb.clientId ? -1 : 1;
}

export function maxHlc(a?: string | null, b?: string | null) {
  return cmpHlc(a, b) >= 0 ? (a ?? null) : (b ?? null);
}
