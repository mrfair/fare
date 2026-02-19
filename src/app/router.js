import { $ } from "./dom.ts";
import { createScope } from "./lifecycle.js";
import { getSession, isAuthed, getRoles } from "./auth.js";

function normalizePath(path) {
  if (!path) return "/";
  const [p] = path.split(/[?#]/);
  let out = p.startsWith("/") ? p : `/${p}`;
  out = out.replace(/\/{2,}/g, "/");
  if (out.length > 1) out = out.replace(/\/+$/g, "");
  return out || "/";
}

function parseQuery(search) {
  const q = {};
  const sp = new URLSearchParams(search || "");
  for (const [k, v] of sp.entries()) {
    if (q[k] === undefined) q[k] = v;
    else if (Array.isArray(q[k])) q[k].push(v);
    else q[k] = [q[k], v];
  }
  return q;
}

function routePathFromFileKey(key) {
  const marker = "/routes/";
  const idx = key.lastIndexOf(marker);
  if (idx === -1) return null;
  const routeTail = key.slice(idx + marker.length);
  const suffix = routeTail.endsWith("/index.js")
    ? "/index.js"
    : routeTail.endsWith("/index.ts")
      ? "/index.ts"
      : null;
  if (!suffix) return null;

  const routeSegment = routeTail.slice(0, -suffix.length);
  const parts = routeSegment.split("/");
  const segs = parts.map((s) => {
    if (s === "root") return "";
    const pm = s.match(/^\[(.+)\]$/);
    if (pm) return `:${pm[1]}`;
    return s;
  }).filter(Boolean);

  return normalizePath("/" + segs.join("/"));
}

function compilePattern(pattern) {
  const keys = [];
  const reStr = pattern.split("/").map((seg) => {
    if (!seg) return "";
    if (seg.startsWith(":")) { keys.push(seg.slice(1)); return "([^/]+)"; }
    return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { re: new RegExp("^" + reStr + "$"), keys };
}

function scorePattern(pattern) {
  return pattern.split("/").filter(Boolean).reduce((s, seg) => s + (seg.startsWith(":") ? 3 : 10), 0);
}

async function safeLoad(loadFn) {
  try { return await loadFn(); } catch (e) { console.error("Route module load failed:", e); return null; }
}

export function createRouter({ appEl = "#app" } = {}) {
  const app = $(appEl);
  if (!app) throw new Error(`Router: app element not found: ${appEl}`);

  const modules = import.meta.glob("../routes/**/index.{js,ts}", { eager: false });

  const table = Object.keys(modules).map((key) => {
    const path = routePathFromFileKey(key);
    if (!path) return null;
    const { re, keys } = compilePattern(path);
    return { key, path, load: modules[key], re, keys, score: scorePattern(path) };
  }).filter(Boolean).sort((a, b) => b.score - a.score);

  const exactPathSet = new Set(table.filter(r => !r.path.includes(":")).map(r => r.path));
  const staticLookup = new Map();
  for (const r of table) if (!r.path.includes(":")) staticLookup.set(r.path, r);

  let cleanupStack = [];
  let currentUrl = new URL(window.location.href);

  function cleanupAll() {
    for (let i = cleanupStack.length - 1; i >= 0; i--) {
      try { cleanupStack[i]?.(); } catch {}
    }
    cleanupStack = [];
  }

  function matchOne(pathname) {
    for (const r of table) {
      const m = r.re.exec(pathname);
      if (!m) continue;
      const params = {};
      r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1] || ""));
      return { route: r, params };
    }
    return null;
  }

  function buildNestedChain(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const prefixes = ["/"];
    let cur = "";
    for (const seg of segments) { cur += "/" + seg; prefixes.push(cur); }

    const chain = [];
    for (let i = 0; i < prefixes.length; i++) {
      const p = prefixes[i];
      const isFinal = i === prefixes.length - 1;

      if (!isFinal) {
        if (!exactPathSet.has(p)) continue;
        const exact = staticLookup.get(p) || table.find(r => r.path === p);
        if (exact) chain.push({ route: exact, params: {} });
        continue;
      }
      const matched = matchOne(p);
      if (matched) chain.push(matched);
    }
    return chain;
  }

  function makeCtxBase(url) {
    return {
      path: url.pathname,
      query: parseQuery(url.search),
      url,
      state: history.state ?? null, // <-- navigation state
      session: getSession(),
      isAuthed,
      roles: getRoles(),
      navigate,
      setState,
      prefetch,
    };
  }

  async function runGuard(mod, baseCtx, matchItem) {
    if (typeof mod.guard === "function") {
      const res = await mod.guard({ ...baseCtx, params: matchItem.params });
      return res || { allow: true };
    }
    if (mod.requiresAuth) {
      if (!isAuthed()) return { redirect: `/login?next=${encodeURIComponent(baseCtx.url.pathname + baseCtx.url.search)}` };
      const required = Array.isArray(mod.roles) ? mod.roles : [];
      if (required.length) {
        const have = new Set(getRoles());
        const ok = required.some(r => have.has(r));
        if (!ok) return { status: 403 };
      }
    }
    return { allow: true };
  }

  async function ensureErrorPage(status, fromUrl) {
    const map = { 401: "/401", 403: "/403", 404: "/404" };
    const path = map[status] || "/404";
    const target = staticLookup.get(path);

    if (!target) {
      cleanupAll();
      app.innerHTML = `<div style="padding:16px; font-family: system-ui;">Error ${status}</div>`;
      return;
    }

    const url = new URL(path, window.location.origin);
    if (fromUrl) url.searchParams.set("from", fromUrl.pathname + fromUrl.search);
    history.replaceState(history.state ?? null, "", url);
    currentUrl = url;

    const chain = buildNestedChain(url.pathname);
    await renderChain(chain, url, { bypassGuards: true });
  }

  async function renderChain(chain, url, { bypassGuards = false } = {}) {
    cleanupAll();

    if (!chain || chain.length === 0) {
      await ensureErrorPage(404, url);
      return;
    }

    let host = app;
    let accumulatedParams = {};
    const base = makeCtxBase(url);

    for (const matchItem of chain) {
      const mod = await safeLoad(matchItem.route.load);
      if (!mod) { await ensureErrorPage(404, url); return; }

      if (!bypassGuards) {
        const g = await runGuard(mod, base, matchItem);
        if (g?.redirect) { await navigate(g.redirect, { replace: true }); return; }
        if (g?.status) { await ensureErrorPage(g.status, url); return; }
      }

      // Auto-destroy listeners attached via `$().on(...)` in previous DOM subtree
      try { $.destroyTree(host); } catch {}
      host.innerHTML = mod.template ?? "";
      const outletSelector = mod.outletSelector || "[data-outlet]";
      const outlet = host.querySelector(outletSelector) || host;

      const ctx = {
        ...base,
        root: host,
        outlet,
        params: { ...accumulatedParams, ...matchItem.params },
        $: (sel, c) => $(sel, c ?? host),
      };

      accumulatedParams = ctx.params;

      const cleanup = typeof mod.mount === "function" ? mod.mount(ctx) : null;
      if (typeof cleanup === "function") cleanupStack.push(cleanup);

      host = outlet;
    }
  }

  /**
   * navigate(to, { replace?, state? })
   * - state: serializable object stored in history entry (NOT visible in URL)
   */
  async function navigate(to, { replace = false, state = undefined } = {}) {
    const url = new URL(to, window.location.origin);
    url.pathname = normalizePath(url.pathname);

    const nextState = (state === undefined) ? (history.state ?? null) : state;

    if (replace) history.replaceState(nextState, "", url);
    else history.pushState(nextState, "", url);

    currentUrl = url;
    await renderChain(buildNestedChain(url.pathname), url);
  }

  /**
   * setState(nextState, { replace? })
   * - updates history.state for current URL without navigation
   */
  function setState(nextState, { replace = true } = {}) {
    const url = new URL(window.location.href);
    if (replace) history.replaceState(nextState, "", url);
    else history.pushState(nextState, "", url);
  }

  /**
   * prefetch(path)
   * - loads the matching route module in advance (code-splitting warmup)
   */
  async function prefetch(path) {
    const url = new URL(path, window.location.origin);
    url.pathname = normalizePath(url.pathname);
    const m = matchOne(url.pathname);
    if (!m) return false;
    const mod = await safeLoad(m.route.load);
    return !!mod;
  }

  function start() {
    document.addEventListener("click", (e) => {
      const a = e.target instanceof Element ? e.target.closest("a[data-link]") : null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http")) return;
      e.preventDefault();
      navigate(href);
    });

    window.addEventListener("popstate", () => {
      const url = new URL(window.location.href);
      url.pathname = normalizePath(url.pathname);
      currentUrl = url;
      renderChain(buildNestedChain(url.pathname), url);
    });

    const init = new URL(window.location.href);
    init.pathname = normalizePath(init.pathname);
    currentUrl = init;
    renderChain(buildNestedChain(init.pathname), init);
  }

  return { start, navigate, setState, prefetch, routes: table, getCurrentUrl: () => currentUrl };
}


// DEV: optional leak check (prints scope stats on navigation)
export function __debugLeakReport(scopes) {
  try {
    return scopes.map(s => s.stats?.()).filter(Boolean);
  } catch {
    return [];
  }
}
