> **Vintage vibe, modern build.**  
*fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Deploy / การ Deploy

ทิศทางหลักคือ “build สเตติกไฟล์แล้วเสิร์ฟ `index.html` สำหรับทุก path” เนื่องจาก fare เป็น SPA ที่รันบน Vite + service worker เรียกใช้ router ใน browser

## Build output
- รัน `npm run build` เพื่อ generate สเตติกไฟล์ใน `dist/`.
- ใช้ `npm run preview` เพื่อจำลอง production server ตรง `dist/` (ใช้ HTTP rewrite) ก่อน deploy จริง.
- ตั้งค่า `base` ใน `vite.config.js` ถ้าจะ deploy บน subpath (เช่น GitHub Pages):
  ```js
  export default defineConfig({
    base: "/fare/",
    ...
  });
  ```
  ถ้าไม่แก้ `base` แล้วทำงานบน subpath ทรัพยากร (CSS/JS/SW) อาจโหลดไม่เจอ.

## SPA rewrite (จำเป็น)
- ทุก deployment ต้อง rewrite URL ที่ไม่ใช่ asset ให้ชี้ไปที่ `index.html`, เพื่อให้ router จัดการ path ภายใน.
- **Nginx**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Apache**
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```
- **Netlify**
  `_redirects` ใน root:
  ```text
  /* /index.html 200
  ```
- **Vercel**
  ใช้ `vercel.json` (auto rewrite) หรือเพิ่ม route redirect:
  ```json
  {
    "rewrites": [{ "source": "/*", "destination": "/index.html" }]
  }
  ```
- **GitHub Pages**
  - ตั้ง `base` เป็น `/repo-name/` ถ้า repo name ≠ root.
  - ใช้ workflow/gh-pages ให้ deploy `dist/`.
  - เพิ่ม `404.html` ที่เป็น copy ของ `index.html` หรือใช้ redirect script.
- **Static hosts (S3 + CloudFront, Cloudflare Pages, Surge)**
  - ให้ “Error Document /index.html” และ “Routing rules” ใหม่.
  - CloudFront: ตั้ง `ErrorResponse` 404 → `/index.html`, HTTP 200.

## Service worker & offline
- Service worker register (`src/app/sw-register.js`) รันเฉพาะ `import.meta.env.PROD`.
- SW cache strategy (assets + navigation) ต้อง sync กับ rewrite; อย่า map `scope` เป็นอื่นนอกจาก `/` เว้นแต่ไฟล์ถูก deploy ใน subfolder แล้วตั้ง `base`.
- ถ้าต้อง force update service worker: bump manifest / rename cache, หรือปิด browser cache เพื่อให้ browser โหลด SW ใหม่.
- SW ต้องใช้ HTTPS หรือ `localhost` เท่านั้น — บน production เปิด TLS ให้ครบ.
- ถ้าต้องปิด SW ชั่วคราว ให้แก้ `src/app/sw-register.js` (หรือกำหนด flag อย่าง `window.__SW_DISABLED__ = true` ก่อน import) แล้ว build ใหม่.

## Environment & backend integration
- ถ้ามี API backend ให้แนใจว่า host รองรับ `/api/` (Vite dev server ใช้ proxy ใน `vite.config.js`: `server.proxy = { "/api": "http://localhost:8787" }`).
- ใน production ให้ backend / CDN รองรับ rewrite + CORS สำหรับ `/api` (พร้อม `credentials: "include"` ถ้ามี cookie).
- หากใช้ environment variable (`VITE_API_BASE`, `NODE_ENV`, ฯลฯ) ให้กำหนดใน host (Netlify env vars, Vercel envs, GH Actions secrets).
- SW + router rely on `window.location` — หลีกเลี่ยงการเปลี่ยน path ที่ backend/edge (เช่น AWS API Gateway) โดยไม่ rewrite มา `index.html`.

## Verification checklist
- `npm run preview` แล้วลองรีเฟรช URL แบบลึก (`/users/123`, `/admin/settings`) ว่าขึ้น page ไม่ 404.
- ตรวจ SW: เปิด DevTools > Application > Service Workers ดูว่า `fare-sw.js` active และ scope `/`.
- ตรวจ environment: ลอง `console.log(import.meta.env.BASE_URL)` ใน route ว่าตรงกับที่ expect.
- ตรวจ API: `fetch("/api/ping")` ผ่าน backend (พร้อม credentials ถ้ามี cookie) แล้วตรวจ log.

## Hosting summaries
- **Netlify** – redirect file, environment variables, optional headers ใน `netlify.toml` (`[[headers]]` เพื่อ control caching ของ SW).
- **Vercel** – `vercel.json` rewrites, set env vars in dashboard; deploy auto from GitHub.
- **GitHub Pages** – `gh-pages` branch, `base` config, optional `404.html`.
- **CloudFront + S3** – push `dist/`, invalidate caches, set default root object, error response to `/index.html`.
- **Cloudflare Pages** – static build + `/_routes.json` optional, rewrites built-in.

ทุกการเปลี่ยนแปลงที่ deploy ควรเช็คผ่าน `npm run preview` และ `npm run docs:preview` เพื่อให้แน่ใจว่ารหัสเสิร์ฟถูกต้อง.
