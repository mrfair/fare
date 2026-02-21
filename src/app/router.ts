import { $ } from "./dom.ts";
import { getSession, isAuthed, getRoles, SessionMirror } from "./auth.ts";

type Params = Record<string, string>;
type NavigateOptions = { replace?: boolean; state?: unknown };
type SetStateOptions = { replace?: boolean };
type RouterNavigate = (to: string, options?: NavigateOptions) => Promise<void>;
type RouterPrefetch = (path: string) => Promise<boolean>;
type RouterSetState = (nextState: unknown, options?: SetStateOptions) => void;

type RouteGuardResult = { allow?: true; redirect?: string; status?: number };
type RouteModuleLoader = () => Promise<RouteModule>;

interface RouteModule {
  template?: string;
  outletSelector?: string;
  mount?: (ctx: RouterMountContext) => void | (() => void);
  guard?: (ctx: RouterGuardContext) => Promise<RouteGuardResult> | RouteGuardResult;
  requiresAuth?: boolean;
  roles?: string[];
}

interface RouteTableEntry {
  key: string;
  path: string;
  load: RouteModuleLoader;
  re: RegExp;
  keys: string[];
  score: number;
}

interface RouterMatch {
  route: RouteTableEntry;
  params: Params;
}

interface RouterBaseContext {
  path: string;
  query: Record<string, string | string[]>;
  url: URL;
  state: unknown;
  session: SessionMirror | null;
  isAuthed: () => boolean;
  roles: string[];
  navigate: RouterNavigate;
  setState: RouterSetState;
  prefetch: RouterPrefetch;
}

interface RouterGuardContext extends RouterBaseContext {
  params: Params;
}

interface RouterMountContext extends RouterBaseContext {
  root: Element;
  outlet: Element;
  params: Params;
  $: typeof $;
}

export interface RouterInstance {
  start(): void;
  navigate: RouterNavigate;
  setState: RouterSetState;
  prefetch: RouterPrefetch;
  routes: RouteTableEntry[];
  getCurrentUrl(): URL;
}

function normalizePath(path: string): string {
  if (!path) return "/";
  const [p] = path.split(/[?#]/);
  let out = p.startsWith("/") ? p : `/${p}`;
  out = out.replace(/\/{2,}/g, "/");
  if (out.length > 1) out = out.replace(/\/+$/g, "");
  return out || "/";
}

function parseQuery(search: string): Record<string, string | string[]> {
  const q: Record<string, string | string[]> = {};
  const params = new URLSearchParams(search || "");
  for (const [key, value] of params.entries()) {
    if (q[key] === undefined) {
      q[key] = value;
    } else if (Array.isArray(q[key])) {
      (q[key] as string[]).push(value);
    } else {
      q[key] = [q[key] as string, value];
    }
  }
  return q;
}

function routePathFromFileKey(key: string): string | null {
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
  const segs = parts.map((part) => {
    if (part === "root") return "";
    const match = part.match(/^\[(.+)\]$/);
    if (match) return `:${match[1]}`;
    return part;
  }).filter(Boolean);

  return normalizePath("/" + segs.join("/"));
}

function compilePattern(pattern: string) {
  const keys: string[] = [];
  const reStr = pattern.split("/").map((segment) => {
    if (!segment) return "";
    if (segment.startsWith(":")) {
      keys.push(segment.slice(1));
      return "([^/]+)";
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { re: new RegExp("^" + reStr + "$"), keys };
}

function scorePattern(pattern: string): number {
  return pattern.split("/").filter(Boolean).reduce((score, segment) => {
    return score + (segment.startsWith(":") ? 3 : 10);
  }, 0);
}

async function safeLoad(loadFn: RouteModuleLoader): Promise<RouteModule | null> {
  try {
    return await loadFn();
  } catch (error) {
    console.error("Route module load failed:", error);
    return null;
  }
}

export function createRouter({ appEl = "#app" } = {}): RouterInstance {
  const app = $(appEl);
  if (!app) throw new Error(`Router: app element not found: ${appEl}`);

  const modules = import.meta.glob<RouteModule>("../routes/**/index.{js,ts}", { eager: false });

  const table = Object.keys(modules).map((key) => {
    const path = routePathFromFileKey(key);
    if (!path) return null;
    const { re, keys } = compilePattern(path);
    return { key, path, load: modules[key], re, keys, score: scorePattern(path) };
  }).filter((entry): entry is RouteTableEntry => Boolean(entry)).sort((a, b) => b.score - a.score);

  const exactPathSet = new Set(table.filter((r) => !r.path.includes(":")).map((r) => r.path));
  const staticLookup = new Map<string, RouteTableEntry>();
  for (const route of table) {
    if (!route.path.includes(":")) {
      staticLookup.set(route.path, route);
    }
  }

  let cleanupStack: Array<() => void> = [];
  let currentUrl = new URL(window.location.href);

  function cleanupAll(): void {
    for (let i = cleanupStack.length - 1; i >= 0; i--) {
      try {
        cleanupStack[i]?.();
      } catch {
        /* ignore */
      }
    }
    cleanupStack = [];
  }

  function matchOne(pathname: string): RouterMatch | null {
    for (const route of table) {
      const match = route.re.exec(pathname);
      if (!match) continue;
      const params: Params = {};
      route.keys.forEach((key, index) => {
        params[key] = decodeURIComponent(match[index + 1] || "");
      });
      return { route, params };
    }
    return null;
  }

  function buildNestedChain(pathname: string): RouterMatch[] {
    const segments = pathname.split("/").filter(Boolean);
    const prefixes = ["/"];
    let cursor = "";
    for (const segment of segments) {
      cursor += "/" + segment;
      prefixes.push(cursor);
    }

    const chain: RouterMatch[] = [];
    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i];
      const isFinal = i === prefixes.length - 1;

      if (!isFinal) {
        if (!exactPathSet.has(prefix)) continue;
        const exact = staticLookup.get(prefix) || table.find((route) => route.path === prefix);
        if (exact) chain.push({ route: exact, params: {} });
        continue;
      }

      const matched = matchOne(prefix);
      if (matched) chain.push(matched);
    }
    return chain;
  }

  function makeCtxBase(url: URL): RouterBaseContext {
    return {
      path: url.pathname,
      query: parseQuery(url.search),
      url,
      state: history.state ?? null,
      session: getSession(),
      isAuthed,
      roles: getRoles(),
      navigate,
      setState,
      prefetch,
    };
  }

  async function runGuard(mod: RouteModule, baseCtx: RouterBaseContext, matchItem: RouterMatch): Promise<RouteGuardResult> {
    if (typeof mod.guard === "function") {
      const result = await mod.guard({ ...baseCtx, params: matchItem.params });
      return result || { allow: true };
    }

    if (mod.requiresAuth) {
      if (!isAuthed()) {
        return { redirect: `/login?next=${encodeURIComponent(baseCtx.url.pathname + baseCtx.url.search)}` };
      }

      const requiredRoles = Array.isArray(mod.roles) ? mod.roles : [];
      if (requiredRoles.length) {
        const have = new Set(getRoles());
        const allowed = requiredRoles.some((role) => have.has(role));
        if (!allowed) return { status: 403 };
      }
    }

    return { allow: true };
  }

  async function ensureErrorPage(status: number, fromUrl?: URL): Promise<void> {
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

  async function renderChain(chain: RouterMatch[], url: URL, { bypassGuards = false } = {}): Promise<void> {
    cleanupAll();

    if (!chain || chain.length === 0) {
      await ensureErrorPage(404, url);
      return;
    }

    let host: Element = app;
    let accumulatedParams: Params = {};
    const base = makeCtxBase(url);

    for (const matchItem of chain) {
      const mod = await safeLoad(matchItem.route.load);
      if (!mod) {
        await ensureErrorPage(404, url);
        return;
      }

      if (!bypassGuards) {
        const guard = await runGuard(mod, base, matchItem);
        if (guard?.redirect) {
          await navigate(guard.redirect, { replace: true });
          return;
        }
        if (guard?.status) {
          await ensureErrorPage(guard.status, url);
          return;
        }
      }

      try { $.destroyTree(host); } catch {
        /* ignore */
      }
      host.innerHTML = mod.template ?? "";
      const outletSelector = mod.outletSelector || "[data-outlet]";
      const outlet = host.querySelector(outletSelector) || host;

      const ctx: RouterMountContext = {
        ...base,
        root: host,
        outlet,
        params: { ...accumulatedParams, ...matchItem.params },
        $: (sel, container) => $(sel, container ?? host),
      };

      accumulatedParams = ctx.params;

      const cleanup = typeof mod.mount === "function" ? mod.mount(ctx) : null;
      if (typeof cleanup === "function") {
        cleanupStack.push(cleanup);
      }

      host = outlet;
    }
  }

  async function navigate(to: string, { replace = false, state = undefined }: NavigateOptions = {}): Promise<void> {
    const url = new URL(to, window.location.origin);
    url.pathname = normalizePath(url.pathname);

    const nextState = state === undefined ? (history.state ?? null) : state;

    if (replace) {
      history.replaceState(nextState, "", url);
    } else {
      history.pushState(nextState, "", url);
    }

    currentUrl = url;
    await renderChain(buildNestedChain(url.pathname), url);
  }

  function setState(nextState: unknown, { replace = true }: SetStateOptions = {}): void {
    const url = new URL(window.location.href);
    if (replace) history.replaceState(nextState, "", url);
    else history.pushState(nextState, "", url);
  }

  async function prefetch(path: string): Promise<boolean> {
    const url = new URL(path, window.location.origin);
    url.pathname = normalizePath(url.pathname);
    const match = matchOne(url.pathname);
    if (!match) return false;
    const mod = await safeLoad(match.route.load);
    return !!mod;
  }

  function start(): void {
    document.addEventListener("click", (event) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[data-link]") : null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http")) return;
      event.preventDefault();
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

  return {
    start,
    navigate,
    setState,
    prefetch,
    routes: table,
    getCurrentUrl: () => currentUrl,
  };
}

export function __debugLeakReport(scopes: Array<{ stats?: () => unknown }>): unknown[] {
  try {
    return scopes.map((scope) => scope.stats?.()).filter(Boolean) as unknown[];
  } catch {
    return [];
  }
}
