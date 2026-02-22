// resources.ts
import type { QueryCache } from "./query-cache";

export type ResourceOptions = {
  listTtlMs?: number;
  getTtlMs?: number;
};

export type ResourceMethods<TCreate = any, TUpdate = any> = {
  list: (params?: Record<string, any>, opts?: { ttlMs?: number }) => Promise<any>;
  get: (id: string, opts?: { ttlMs?: number }) => Promise<any>;
  create: (payload: TCreate) => Promise<any>;
  update: (id: string, payload: TUpdate) => Promise<any>;
  remove: (id: string) => Promise<any>;
};

export function createResource<TCreate, TUpdate>(
  client: any,
  basePath: string,
  cache?: QueryCache,
  options: ResourceOptions = {}
) {
  return {
    list: (params?: Record<string, any>, opts?: { ttlMs?: number }) => {
      const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
      if (!cache) return client.get(`${basePath}${qs}`);
      const ttl = opts?.ttlMs ?? options.listTtlMs;
      return cache.query([basePath, "list", params ?? {}], () => client.get(`${basePath}${qs}`), { ttlMs: ttl });
    },

    get: (id: string, opts?: { ttlMs?: number }) => {
      if (!cache) return client.get(`${basePath}/${id}`);
      const ttl = opts?.ttlMs ?? options.getTtlMs ?? 5 * 60_000;
      return cache.query([basePath, "get", id], () => client.get(`${basePath}/${id}`), { ttlMs: ttl });
    },

    create: async (payload: TCreate) => {
      const res = await client.post(basePath, payload);
      cache?.invalidate([basePath]); // invalidate list/get ที่เกี่ยว
      return res;
    },

    update: async (id: string, payload: TUpdate) => {
      const res = await client.patch(`${basePath}/${id}`, payload);
      cache?.invalidate([basePath]);
      return res;
    },

    remove: async (id: string) => {
      const res = await client.delete(`${basePath}/${id}`);
      cache?.invalidate([basePath]);
      return res;
    },
  };
}
