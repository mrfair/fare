/**
 * Minimal in-memory store with optional persistence helpers.
 */
type PrimitiveRecord = Record<string, unknown>;

type DeepMergeResult = PrimitiveRecord | undefined;

function deepMerge(a: unknown, b: unknown): DeepMergeResult {
  if (
    a && b &&
    typeof a === "object" &&
    typeof b === "object" &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const base = { ...(a as PrimitiveRecord) };
    for (const key of Object.keys(b as PrimitiveRecord)) {
      base[key] = deepMerge((a as PrimitiveRecord)[key], (b as PrimitiveRecord)[key]);
    }
    return base;
  }
  return b as PrimitiveRecord | undefined;
}

const _state: PrimitiveRecord = Object.create(null);
const _subs = new Set<() => void>();

export const store = {
  get<T = unknown>(key: string): T | undefined {
    return _state[key] as T | undefined;
  },
  set<T>(key: string, value: T): T {
    _state[key] = value;
    _subs.forEach((fn) => fn());
    return value;
  },
  patch<T extends PrimitiveRecord>(key: string, partial: Partial<T>): T | undefined {
    _state[key] = deepMerge(_state[key], partial);
    _subs.forEach((fn) => fn());
    return _state[key] as T | undefined;
  },
  all(): PrimitiveRecord {
    return { ..._state };
  },
  subscribe(fn: () => void): () => void {
    _subs.add(fn);
    return () => _subs.delete(fn);
  },
  loadFrom(storage: Storage, key = "__store__"): void {
    try {
      const raw = storage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        for (const [stateKey, value] of Object.entries(parsed)) {
          _state[stateKey] = value;
        }
        _subs.forEach((fn) => fn());
      }
    } catch {
      // ignore
    }
  },
  saveTo(storage: Storage, key = "__store__"): void {
    try {
      storage.setItem(key, JSON.stringify(_state));
    } catch {
      // ignore
    }
  },
};
