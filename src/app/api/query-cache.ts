// queryCache.ts
type CacheEntry<T> = { data?: T; expiresAt?: number; inFlight?: Promise<T> };

export function createQueryCache() {
  const store = new Map<string, CacheEntry<any>>();

  function getKey(parts: any[]) {
    return JSON.stringify(parts);
  }

  async function query<T>(keyParts: any[], fetcher: () => Promise<T>, opts?: { ttlMs?: number }): Promise<T> {
    const key = getKey(keyParts);
    const now = Date.now();
    const ttl = opts?.ttlMs ?? 60_000;

    const entry = store.get(key) ?? {};

    if (entry.data !== undefined && entry.expiresAt && entry.expiresAt > now) return entry.data;
    if (entry.inFlight) return entry.inFlight;

    const p = fetcher()
      .then((data) => {
        store.set(key, { data, expiresAt: now + ttl });
        return data;
      })
      .finally(() => {
        const e = store.get(key);
        if (e) store.set(key, { ...e, inFlight: undefined });
      });

    store.set(key, { ...entry, inFlight: p });
    return p;
  }

  function invalidate(prefixParts: any[]) {
    const prefix = JSON.stringify(prefixParts);
    for (const k of store.keys()) if (k.startsWith(prefix.slice(0, -1))) store.delete(k);
  }

  return { query, invalidate };
}