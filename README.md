# fare

Vintage vibe, modern build.

**fare** is a route-first vanilla SPA toolkit for jQuery/vanilla developers who want to organize apps by page, keep renders predictable, and avoid chasing costly rerender chains.

<p align="center">
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-b45309.svg"></a>
  <a href="./.github/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/badge/CI-GitHub_Actions-0f766e.svg"></a>
  <img alt="bundler" src="https://img.shields.io/badge/bundler-Vite-1f2937.svg">
  <img alt="offline" src="https://img.shields.io/badge/offline-Service_Worker-1f2937.svg">
  <img alt="dx" src="https://img.shields.io/badge/DX-jQuery_like_%24-1f2937.svg">
</p>

## Why use fare?

- **Route-first structure** – folders define routes and nested layouts, so you can think in pages instead of components before wiring navigation.
- **Predictable lifecycle** – guards (401/403/404) and scoped cleanup (timers, listeners, fetches, observers) keep each route lean.
- **jQuery-ish ergonomics** – a `$` wrapper that feels like jQuery (including `$("<button>")` element creation) without pulling in a DOM library.
- **Performance-friendly output** – dynamic imports split code per route and its CSS, plus a service worker-ready loader that keeps cache hits fast.
- **Design goal** – predictable UIs, fast loading, and “no surprise rerenders.”

> EN: A modern toolkit for people who still want the simplicity of jQuery-style DOM control.

> TH: ระบบ SPA โครงชัด “คิดเป็นหน้า (route) ก่อน” เรียกใช้งานง่าย อัปเดต UI แบบตรง ๆ ไม่ต้องไล่ rerender chain.

## Quick start

```bash
npm install
npm run dev
```

- **Develop** with `npm run dev` (Vite) and keep `src/routes` as the entrypoint for each page.
- **Build** with `npm run build` and check the production bundle with `npm run preview`.
- **Docs site** is powered by VitePress:
  - `npm run docs:dev` (self-hosted doc server)
  - `npm run docs:build` (static output for GitHub Pages)
  - `npm run docs:preview` (preview the built docs)
- **TypeScript route sample** at `/ts-example` demonstrates how to use typed helpers, router hooks, and query params inside `src/routes/ts-example/index.ts`.
- **Type-check** with `npm run type-check` to keep the TS sources synced with `tsconfig.json`.
- **Test** with `npm run test` (Vitest + jsdom) to verify MiniQuery helpers against the DOM wrappers.

> Note: Static hosts should rewrite all paths to `index.html`. See `docs/DEPLOY.md` for platform-specific tips.

## Documentation & guides

The `docs/` folder holds comprehensive guides (Thai/English) for:

- `docs/GETTING_STARTED.md` – directory structure, routing, and lifecycle basics
- `docs/ROUTING.md` – file-based/nested layouts plus guard patterns
- `docs/LIFECYCLE.md` – automatic teardown, `$.destroyTree`, and `isActive()`
- `docs/COMPONENTS.md` – building reusable widgets with `$`-wrapped DOM
- `docs/JQUERY.md` – full reference of the `$`/`$$` helpers and cleanup expectations
- `docs/DEPLOY.md` – rewrites, service worker considerations, SEO headers
- `docs/FAQ.md` – common questions and troubleshooting, including rerender myths
- `docs/VERSIONING.md` – release workflow powered by Changesets
- `docs/README.md` – entry point with command references and navigation

## Community & contribution

- Follow the [code of conduct](CODE_OF_CONDUCT.md) and read [CONTRIBUTING.md](CONTRIBUTING.md) before sending changes.
- Security issues go through [SECURITY.md](SECURITY.md).
- Stay in sync with the project via [CHANGELOG.md](CHANGELOG.md) and Releases powered by Changesets.

## License

MIT © 2026 — see `LICENSE`.
