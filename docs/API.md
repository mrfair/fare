---
title: Application API
---

# API helper guide

This repo exposes a centralized API layer in `src/app/api`. Routes fetch data through that layer so every call benefits from shared auth headers, consistent error handling, and optional caching.

## Core surface

### `createApi`
- Located at `src/app/api/index.ts`
- Call `createApi({ fetch, basePath?, getToken?, cache? })` once (the router does this) and pass the resulting `FareApi` instance into each route via the `ctx.api` context.
- The returned object exposes:
  * `resource(name)` – CRUD helper backed by `src/app/api/resource.ts` plus optional cache support (`query-cache.ts`) for `list/get`, plus `create/update/remove`.
  * `endpoint(path)` – lightweight helper for arbitrary REST calls (GET/POST/PATCH/DELETE) with TTL caching for GETs.
  * `client` – raw HTTP wrapper, plus `cache` helpers (`invalidate`, `clear`) if you need manual control.

### Resources
- `resource("items")` gives you `.list()`, `.get(id)`, `.create(payload)`, `.update(id, payload)`, `.remove(id)` already wired to `ctx.api.resource("items")`.
- When you mutate, the cache invalidates the `list`/`get` keys automatically so UI can stay in sync.

## Example usage

See `src/routes/api-demo/index.ts` for the reference implementation. It demonstrates:

```ts
const health = ctx.api.endpoint("/health");
await health.get(); // GET /api/health

const items = ctx.api.resource<Item, { title: string }>("items");
await items.list();
await items.create({ title: "New" });
```

Every route receives the same `FareApi` instance through `ctx.api`, so copy that pattern when you build new pages.

## Notes

- Keep your fetch logic inside `src/app/api`; avoid sprinkling manual `fetch` calls across routes unless you really need a different base URL or headers.
- The docs page `src/routes/api-demo` ships with this file (see `docs/API.md`) to show the API helpers in action with JSON output and cleanup hooks via the shared `$` utilities.
