// src/app/db/clock.ts
// Simple HLC-ish clock: wallTimeMs + counter + clientId => string sortable by tuple.
// Format: "<ms>-<counter>-<clientId>"
// Works as deterministic LWW tie-breaker for dev/v1.

let lastMs = 0;
let counter = 0;

export function nextHlc(clientId: string) {
  const now = Date.now();
  if (now === lastMs) counter += 1;
  else { lastMs = now; counter = 0; }
  return `${now}-${counter}-${clientId}`;
}
