// src/app/fare-env.ts
// Single place for config via .env (Vite uses VITE_*)

const asBool = (v: any, fallback = false) => {
  if (v === undefined || v === null || v === "") return fallback;
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
};

export const fareEnv = {
  dbName: import.meta.env.VITE_FARE_DB_NAME || "fare",
  sync: {
    type: import.meta.env.VITE_FARE_SYNC_ENDPOINT_TYPE || "workers",
    endpoint: import.meta.env.VITE_FARE_SYNC_ENDPOINT || "",
    enabled: asBool(import.meta.env.VITE_FARE_SYNC_ENABLED, true),
  },
} as const;

export const shouldEnableSync = fareEnv.sync.enabled && !!fareEnv.sync.endpoint;
