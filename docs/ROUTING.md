> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Routing / ระบบ Route

fare ใช้ระบบ file-based routing เป็นหลัก: ทุกโฟลเดอร์ใน `src/routes/` ที่มี `index.js` จะกลายเป็น route หนึ่งในแอป โดยชื่อโฟลเดอร์แปลงเป็น path แบบง่าย ๆ (เช่น `about` → `/about`, `users/[id]` → `/users/:id`) และ `root` คือหน้าแรก (`/`) ที่กลายเป็น layout หลักของแอป

## File-to-path mapping
- **ตอน build** Vite จะโหลดโมดูลทั้งหมดจาก `src/routes/**/index.js` ด้วย `import.meta.glob("../routes/**/index.js")`
- **ชื่อโฟลเดอร์แบบ `[param]`** จะกลายเป็น dynamic segment (ตัวอย่าง: `src/routes/users/[id]/index.js` → `/users/:id`)
- **เส้นทางซ้อน** เช่น `src/routes/admin/index.js` + `src/routes/admin/settings/index.js` จะตีความว่า `/admin` เป็น layout และ `/admin/settings` เป็น child route ที่สืบทอด layout เดียวกัน
- ระบบจัดเรียงเส้นทางโดยพิจารณา `score` (static segment ได้คะแนนสูงกว่า dynamic) เพื่อให้ match ของหน้า `/users/123` เกิดหลัง match ของ route แบบทั่วไป

## Layouts & outlets
- แต่ละ `index.js` สามารถส่งออก `template` (HTML string) ที่จะเติมลงใน `host` element (`#app` หรือ outlet ของ layout พ่อ)
- Layout ส่วนกลางใช้ `<div data-outlet></div>` เพื่อบอกจุดที่ route ลูกจะแทรก DOM ตัวอย่าง: layout `src/routes/root/index.js` อาจเป็น layout ของทั้งแอป และ route `/about` แสดงผลภายใน `<div data-outlet>`
- ถ้า route ไม่มี `data-outlet` ระบบจะใช้ root element เดิม (`host`)
- รัน `mount(ctx)` หลังจากแทรก template; ตัวแปร `ctx` จะแบ่งปันข้อมูลสำคัญ เช่น `ctx.root`, `ctx.outlet`, `ctx.params`, `ctx.query`, `ctx.url`, `ctx.state`, `ctx.navigate`, `ctx.prefetch`, `ctx.$`, และ `ctx.isAuthed()`
- อย่าลืมส่งคืน cleanup function (หรือ `null`) จาก `mount` เพื่อให้ router จัดการ teardown อัตโนมัติเมื่อ route เปลี่ยน

## Guards / สิทธิ์การเข้าถึง
- **Route exports** ที่ router จะตรวจสอบก่อนเรียก `mount`:
  - `requiresAuth = true` จะเรียก `isAuthed()` (ดู `src/app/auth.js:1-54`) ซึ่งอ่าน session mirror จาก `localStorage` (`spa_demo_session_v1`) เพื่อให้ guard ทำงานแบบ synchronous; ถ้า `false` จะ redirect ไป `/login?next=…`
  - `roles = ["admin"]` ระบุชุดบทบาทที่ผู้ใช้ต้องมี (router เรียก `getRoles()` ที่ดึงมาจาก session ที่ mirror โดย `bootstrapSession()` ก่อน router start `src/app/main.js:1-20`)
  - `guard(ctx)` ฟังก์ชัน async ที่คืน `{ allow: true }`, `{ redirect: "/path" }`, หรือ `{ status: 401/403 }` เพื่อจัดการ logic พิเศษ
- Router ตรวจสอบ guard ตามลำดับนี้แล้ว:
  1. `guard(ctx)` ถ้ามีคำตอบ `{ redirect }` จะเรียก `navigate` ใหม่ทันที (พร้อม `replace`)
  2. ถ้า guard คืน `{ status }` จะโชว์หน้า error (401/403/404) ผ่าน `ensureErrorPage`
  3. ถ้าไม่มี guard (หรือคืน `{ allow: true }`) จะ proceed ไป layout → mount

### ทำไม `isAuthed()` ไม่เรียก API ตรง ๆ
- Router ต้องทำงาน synchronous จึงไม่สามารถ await API ทุกครั้งได้ เลยเก็บ snapshot ของ session ไว้ใน `localStorage` (`setSession()`/`bootstrapSession()`), ดังนั้น `isAuthed()` เพียงเช็คว่ามี snapshot อยู่หรือไม่
- ฟังก์ชัน `bootstrapSession()` (`src/app/auth.js:20-55`) จะเรียก `/api/auth/me` (credentials include) เพื่อตรวจสอบ cookie ที่ backend เซ็ตไว้แล้ว mirror ลง `localStorage`; เรียกครั้งแรกใน `main.js` ก่อน router start (`src/app/main.js:1-20`) เพื่อ ensure กรณี login เสร็จแล้ว
- ถ้าต้อง sync ใหม่หลัง login หรือ logout, สามารถเรียก `bootstrapSession()` เองก่อน `navigate` หรือ refresh หน้า (เช่น รีเฟรช `window.location` หลังกลับจาก OAuth)

### ตัวอย่าง flow การล็อกอิน
- เปิด `src/routes/login/index.js` จะเห็นปุ่ม:
  ```js
  $("#googleBtn", root).on("click", () => {
    window.location.href = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
  });
  ```
  ปุ่มส่งผู้ใช้ไปยัง backend (Vite proxy: `/api` → worker) เพื่อเริ่ม Google OAuth; หลัง user ยืนยันแล้ว backend จะตั้ง HttpOnly cookie และ redirect กลับมาที่แอป (path ที่อยู่ใน `next`)
- เมื่อแอปโหลดอีกครั้ง `bootstrapSession()` จะ fetch `/api/auth/me` แล้วเก็บ session ลง `localStorage`; ตอนนี้ `isAuthed()` จะคืน `true`, guard ที่ต้องการ `requiresAuth` ผ่าน
- ไม่จำเป็นต้องเรียก API เองโดยตรงเพื่ออ่าน token — แค่เข้าหน้า login แล้วให้ backend จัดการ cookie/redirect ส่วน session mirror ถูกจัดการโดย `bootstrapSession()` อัตโนมัติ
- ถ้าอยากออกจากระบบก็เรียก `logout()` (`src/app/auth.js:40-58`), ซึ่ง POST ไป `/api/auth/logout` แล้วล้าง session mirror ด้วย `setSession(null)`

### ตัวอย่าง Guard module
```js
export const requiresAuth = true;
export const roles = ["admin"];

export async function guard(ctx) {
  if (!ctx.isAuthed()) {
    return { redirect: `/login?next=${encodeURIComponent(ctx.url.pathname + ctx.url.search)}` };
  }
  const haveRole = ctx.roles.some((role) => role === "admin");
  if (!haveRole) return { status: 403 };
  return { allow: true };
}
```
- `ctx` มาจาก router (ดู `src/app/router.js:170-230`) และรวม `isAuthed`, `roles`, `url`, `navigate` ฯลฯ
- ถ้า guard ส่ง `{ redirect }` จะไปหน้าที่กำหนด, ถ้าคืน `{ status: 401/403 }` จะโชว์หน้า error, และ default คือ `allow` ให้ route ทำงานต่อ

Router จะเรียก `ensureErrorPage` (พร้อม route `/401`, `/403`, `/404`) ถ้า guard ส่ง error status หรือไม่มี route ตรงตาม path

## Navigation helpers
- โหลด `<a>` ที่มี `data-link` แล้วเรียก `navigate(href)` เพื่อทำ SPA navigation (ป้องกัน reload) — อ้างอิง `router.js` ส่วน listener click global
- ถ้าต้อง prefetch route ก่อนให้เรียก `ctx.prefetch("/users/123")` เพื่อ warm up dynamic import
- ใช้ `ctx.navigate(path, { replace?, state? })` เพื่อเปลี่ยน route โดยยังส่ง state หรือแทนที่ entry เดิมใน history API
- `ctx.setState(state, { replace?: boolean })` อัปเดต `history.state` โดยไม่เปลี่ยน URL

## Lifecycle & cleanup
- router จะ:
  1. เรียก cleanup stack ที่ `mount` คืนมา (เรียงย้อนกลับ)
  2. เรียก `$.destroyTree(host)` + MutationObserver เพื่อล้าง listeners ที่ผูกด้วย `$().on(...)`
  3. `createScope` และ scope helpers ใน `mount` (เช่น `setInterval`, `fetch`, `on(window, ...)`, `observeResize`) ที่ช่วยให้ route ทำความสะอาดเอง
- **กฎ**: ผูก event ผ่าน `$().on(...)` และ `use(fnCleanup)` เพื่อให้ระบบ auto-clean teardown ได้ครบ

## Params & query
- `ctx.params` ถูกเติมโดย router จาก dynamic segment (เช่น `:id`)
- `ctx.query` มาจาก `parseQuery(window.location.search)` และจะรวมหลายค่าถ้ามีหลายครั้ง (Array)
- ถ้าต้องการ serialize `selected` state ให้ใช้ `ctx.setState` แล้วอ่านจาก `ctx.url.state` หลังจาก navigation

## Troubleshooting
- เรียก `ensureErrorPage(404)` ให้แน่ใจว่ามี `src/routes/404/index.js`
- ถ้า route ไม่โหลด ให้เช็คว่า `index.js` อยู่ในโฟลเดอร์ที่ถูกต้อง (ต้องเป็น path ที่ glob `../routes/**/index.js` เจอ)
- ใช้ `ctx.$` หรือ `$` จาก `src/app/dom.js` เพื่อเลือก/สร้าง element ในบริบทของ route
