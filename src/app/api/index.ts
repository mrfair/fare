// src/app/api/index.ts
//
// Fare API standard (vanilla-friendly):
//   const schools = ctx.api.resource("schools");
//   await schools.list();
//   await schools.create({ name: "ABC" });
//
// Design goals:
// - No hardcoded resources in core
// - Consistent CRUD surface via resource(name)
// - Cache + TTL + dedupe for list/get by default
// - Works with any backend (REST-ish); basePath is configurable

import { createQueryCache, type QueryCache } from "./query-cache";
import { createResource, type ResourceOptions, type ResourceMethods } from "./resource";

export type FareApi = ReturnType<typeof createApi>;

export type ApiError = {
  code?: string;
  message: string;
  status?: number;
  details?: unknown;
  requestId?: string;
};

export type ApiClient = {
  get: <T = any>(path: string, init?: RequestInit) => Promise<T>;
  post: <T = any>(path: string, body?: any, init?: RequestInit) => Promise<T>;
  patch: <T = any>(path: string, body?: any, init?: RequestInit) => Promise<T>;
  del: <T = any>(path: string, init?: RequestInit) => Promise<T>;
};

function toUrl(basePath: string, path: string) {
  // If path already starts with basePath (or is absolute URL), keep it.
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith(basePath + "/") || path === basePath) return path;
  if (path.startsWith("/")) return `${basePath}${path}`;
  return `${basePath}/${path}`;
}

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeError(res: Response, details: any): ApiError {
  const requestId =
    res.headers.get("x-request-id") ||
    res.headers.get("x-correlation-id") ||
    undefined;

  return {
    code: (details && (details.code || details.errorCode)) || `HTTP_${res.status}`,
    message: (details && (details.message || details.error)) || res.statusText || "Request failed",
    status: res.status,
    details,
    requestId,
  };
}

export function createApi(opts: {
  fetch: typeof window.fetch;
  getToken?: () => string | null;
  basePath?: string; // default "/api"
  cache?: QueryCache; // optional: inject shared cache (otherwise internal singleton)
}) {
  const basePath = opts.basePath ?? "/api";
  const cache = opts.cache ?? sharedCacheSingleton;

  const authHeaders = () => {
    const token = opts.getToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const client: ApiClient = {
    get: async <T>(path: string, init: RequestInit = {}) => {
      const url = toUrl(basePath, path);
      const res = await opts.fetch(url, {
        ...init,
        method: "GET",
        headers: { ...authHeaders(), ...(init.headers || {}) },
      });
      const body = await parseBody(res);
      if (!res.ok) throw normalizeError(res, body);
      return body as T;
    },

    post: async <T>(path: string, body?: any, init: RequestInit = {}) => {
      const url = toUrl(basePath, path);
      const isForm = typeof FormData !== "undefined" && body instanceof FormData;
      const res = await opts.fetch(url, {
        ...init,
        method: "POST",
        body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
        headers: {
          ...authHeaders(),
          ...(isForm ? {} : { "Content-Type": "application/json" }),
          ...(init.headers || {}),
        },
      });
      const out = await parseBody(res);
      if (!res.ok) throw normalizeError(res, out);
      return out as T;
    },

    patch: async <T>(path: string, body?: any, init: RequestInit = {}) => {
      const url = toUrl(basePath, path);
      const res = await opts.fetch(url, {
        ...init,
        method: "PATCH",
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
          ...(init.headers || {}),
        },
      });
      const out = await parseBody(res);
      if (!res.ok) throw normalizeError(res, out);
      return out as T;
    },

    del: async <T>(path: string, init: RequestInit = {}) => {
      const url = toUrl(basePath, path);
      const res = await opts.fetch(url, {
        ...init,
        method: "DELETE",
        headers: { ...authHeaders(), ...(init.headers || {}) },
      });
      const out = await parseBody(res);
      if (!res.ok) throw normalizeError(res, out);
      return out as T;
    },
  };

  // Dynamic CRUD resource
  function resource<TCreate = any, TUpdate = any>(
    name: string,
    options?: ResourceOptions
  ): ResourceMethods<TCreate, TUpdate> {
    return createResource<TCreate, TUpdate>(client, `${basePath}/${name}`, cache, options);
  }

  // Optional: a lightweight endpoint helper for non-CRUD calls
  function endpoint(path: string) {
    const full = toUrl(basePath, path);
    return {
      get: <T = any>(params?: Record<string, any>, opt?: { ttlMs?: number }) => {
        const u = new URL(full, location.origin);
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            if (v === undefined || v === null) continue;
            u.searchParams.set(k, String(v));
          }
        }
        // cache GET by default (short TTL)
        return cache.query(
          [full, "get", params || {}],
          () => client.get<T>(u.pathname + u.search),
          { ttlMs: opt?.ttlMs ?? 30_000 }
        );
      },
      post: <T = any>(body?: any) => client.post<T>(full, body),
      patch: <T = any>(body?: any) => client.patch<T>(full, body),
      del: <T = any>() => client.del<T>(full),
    };
  }

  return {
    client,   // expose if you want raw calls
    resource, // ✅ ctx.api.resource("schools")
    endpoint, // optional
    cache: {
      invalidate: (prefixParts: any[]) => cache.invalidate(prefixParts),
      clear: () => cache.clear(),
    },
  };
}

/** Shared cache across navigations by default (good UX for super apps). */
const sharedCacheSingleton = createQueryCache();