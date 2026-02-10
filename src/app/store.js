/**
 * Minimal global store (vanilla)
 * - In-memory by default (lost on refresh)
 * - Optional persistence helpers to sessionStorage/localStorage
 *
 * Usage:
 *   import { store } from "../app/store.js";
 *   store.set("draft", { title: "hello" });
 *   const v = store.get("draft");
 *   const unsub = store.subscribe(() => { ... });
 */
function deepMerge(a, b) {
  if (a && typeof a === "object" && !Array.isArray(a) && b && typeof b === "object" && !Array.isArray(b)) {
    const out = { ...a };
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
    return out;
  }
  return b;
}

const _state = Object.create(null);
const _subs = new Set();

export const store = {
  get(key) {
    return _state[key];
  },
  set(key, value) {
    _state[key] = value;
    _subs.forEach((fn) => fn());
    return value;
  },
  patch(key, partial) {
    _state[key] = deepMerge(_state[key], partial);
    _subs.forEach((fn) => fn());
    return _state[key];
  },
  all() {
    return { ..._state };
  },
  subscribe(fn) {
    _subs.add(fn);
    return () => _subs.delete(fn);
  },
  // ---- persistence helpers (opt-in) ----
  loadFrom(storage, key = "__store__") {
    try {
      const raw = storage.getItem(key);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") {
        for (const [k, v] of Object.entries(obj)) _state[k] = v;
        _subs.forEach((fn) => fn());
      }
    } catch {}
  },
  saveTo(storage, key = "__store__") {
    try {
      storage.setItem(key, JSON.stringify(_state));
    } catch {}
  },
};
