const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const OFFLINE_HTML = `<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline</title></head>
<body style="font-family:system-ui;padding:16px">
<h1 style="margin:0 0 8px 0;">ออฟไลน์</h1>
<p style="margin:0;color:#555;line-height:1.6">ตอนนี้ไม่มีอินเทอร์เน็ต และยังไม่มีไฟล์ในแคชสำหรับหน้านี้</p>
</body></html>`;

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(
      new Request("/offline.html", { cache: "reload" }),
      new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    );
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (![STATIC_CACHE, RUNTIME_CACHE].includes(k)) {
        return caches.delete(k);
      }
      return Promise.resolve();
    }));
    self.clients.claim();
  })());
});

function isAssetRequest(req: Request): boolean {
  const url = new URL(req.url);
  const path = url.pathname;
  return path.startsWith("/assets/") || /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf)$/.test(path);
}

async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const res = await fetch(request);
  if (request.method === "GET" && res.ok) {
    await cache.put(request, res.clone());
  }
  return res;
}

async function networkFirst(request: Request): Promise<Response> {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const res = await fetch(request);
    if (request.method === "GET" && res.ok) {
      await cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    const staticCache = await caches.open(STATIC_CACHE);
    return (await staticCache.match("/offline.html")) || new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request, { ignoreSearch: false });

  const fetchPromise = fetch(request)
    .then((res) => {
      if (request.method === "GET" && res.ok) {
        cache.put(request, res.clone());
      }
      return res;
    })
    .catch(() => null);

  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}

self.addEventListener("fetch", (event: FetchEvent) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  if (isAssetRequest(req)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});
