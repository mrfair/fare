```text
███████╗ █████╗ ██████╗ ███████╗
██╔════╝██╔══██╗██╔══██╗██╔════╝
█████╗  ███████║██████╔╝█████╗  
██╔══╝  ██╔══██║██╔══██╗██╔══╝  
██║     ██║  ██║██║  ██║███████╗
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
```


<p align="center">
  <em>Vintage vibe, modern build.</em><br/>
  ชุดเครื่องมือ SPA แบบ <strong>route-first</strong> สำหรับคนเขียน jQuery/Vanilla — ไม่ต้องปวดหัวเรื่อง rerender/state
</p>

<p align="center">
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-b45309.svg"></a>
  <a href="./.github/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/badge/CI-GitHub_Actions-0f766e.svg"></a>
  <img alt="bundler" src="https://img.shields.io/badge/bundler-Vite-1f2937.svg">
  <img alt="offline" src="https://img.shields.io/badge/offline-Service_Worker-1f2937.svg">
  <img alt="dx" src="https://img.shields.io/badge/DX-jQuery_like_%24-1f2937.svg">
</p>

---

## ✦ What is fare?

**EN** — A route-first vanilla SPA toolkit that feels familiar to jQuery/vanilla developers.  
**TH** — ระบบ SPA โครงชัด “คิดเป็นหน้า (route) ก่อน” ใช้งานง่าย อัปเดต UI แบบตรง ๆ ไม่ต้องไล่ rerender chain

> **Design goal:** predictable UI, fast loads, and “no surprise rerenders”.

---

## ✦ Highlights

- **File-based routing** (+ nested layouts): routes = folders
- **Guards**: 401 / 403 / 404 patterns
- **Code-splitting per route** (dynamic import) + **CSS split** (cache-friendly)
- **`$` jQuery-like wrapper (vanilla)** + supports **`$('<button>')`** element creation
- **Auto-destroy** for event listeners:
  - on route change: `$.destroyTree(host)`
  - on DOM removal: MutationObserver
- **Lifecycle scope (A–D)**:
  - auto abort fetch, auto clear timers, auto remove global listeners, observer cleanup
  - `isActive()` to prevent async race updates

---

## ✦ Quick Start

### Development
```bash
npm i
npm run dev
```

### Build & Preview
```bash
npm run build
npm run preview
```

> **Note (Deploy / Refresh 404):**  
> Static hosting ต้องตั้ง rewrite ทุก path → `index.html` (ดู `docs/DEPLOY.md`)

---

## ✦ “Feels like jQuery” examples

### Create element like jQuery
```js
const btn = $("<button class='btn'>OK</button>")
  .on("click", () => console.log("click"))
  .addClass("primary");

// optional cleanup (if you keep references)
btn.destroy();
```

### Component style (ESM)
```js
// src/components/bt.js
export function bt() {
  return $("<button class='btn'>Click</button>")
    .on("click", () => console.log("hi"));
}
```

---


## ✦ Docs Site (VitePress)

```bash
npm run docs:dev
```

Build for GitHub Pages:
```bash
npm run docs:build
```

## ✦ Documentation (TH/EN)
- `docs/README.md` — docs index
- `docs/GETTING_STARTED.md`
- `docs/ROUTING.md`
- `docs/LIFECYCLE.md`
- `docs/COMPONENTS.md`
- `docs/CACHING.md`
- `docs/DEPLOY.md`
- `docs/FAQ.md`
- `docs/VERSIONING.md`

---

## ✦ Community
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `CHANGELOG.md`

---

## License
MIT © 2026 — see `LICENSE`.
