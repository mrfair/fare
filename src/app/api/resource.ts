// resources.ts
export function createResource<TCreate, TUpdate>(client: any, basePath: string, cache?: ReturnType<typeof import("./query-cache").createQueryCache>) {
  return {
    list: (params?: Record<string, any>, opts?: { ttlMs?: number }) => {
      const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
      if (!cache) return client.get(`${basePath}${qs}`);
      return cache.query([basePath, "list", params ?? {}], () => client.get(`${basePath}${qs}`), { ttlMs: opts?.ttlMs });
    },

    get: (id: string, opts?: { ttlMs?: number }) => {
      if (!cache) return client.get(`${basePath}/${id}`);
      return cache.query([basePath, "get", id], () => client.get(`${basePath}/${id}`), { ttlMs: opts?.ttlMs ?? 5 * 60_000 });
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