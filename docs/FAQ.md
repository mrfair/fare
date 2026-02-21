> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# FAQ

## Refresh แล้ว 404
ต้อง rewrite ทุก request ที่ไม่ใช่ asset ไปที่ `index.html` (ดู `docs/DEPLOY.md` สำหรับตัวอย่าง Nginx/Netlify/Vercel). ถ้าใช้ GitHub Pages อย่าลืมเพิ่ม `404.html` (หรือ copy `index.html`) ให้ client-side router รับช่วงต่อ.

## Auto-destroy ครอบคลุมแค่ไหน
`$.destroyTree(host)` + MutationObserver จะล้าง event ที่ผูกด้วย `$().on(...)` เมื่อ router สลับหน้า หากใช้ตัวช่วยใน `mount` (`setTimeout`, `fetch`, `on`, `observe*`) ระบบจะล้าง timers, abort fetch, remove listeners/observers อัตโนมัติ. ถ้า HTML component มี cleanup พิเศษ ให้คืนฟังก์ชันจาก `mount` หรือ call `use(() => cleanup())`.

## ทำไมไม่ใช้ VDOM
fare เน้น event-driven UI แบบตรงไปตรงมา (คิดเป็นหน้า/route ก่อน) เพื่อหลีกเลี่ยงสถานะที่กระจัดกระจายและปัญหา rerender ที่ต้องไล่ตามทั้ง tree; เราแค่ wrap DOM แบบ jQuery แล้วจัดกลุ่ม lifecycle ให้ predictable.

## ถ้าต้องการเพิ่ม guard มันทำยังไง
ในโมดูล route (`src/routes/.../index.js`) export `requiresAuth`, `roles`, หรือ `async guard(ctx)` เพื่อให้ router ตรวจ `isAuthed()` / `getRoles()` ก่อน `mount`. อ้างอิง `docs/ROUTING.md` สำหรับ flow และตัวอย่าง redirect ไป `/login?next=...`.

## จะสร้าง component ใหม่ยังไง
เก็บไว้ที่ `src/components/`. ฟังก์ชันควรรับ props แล้วคืน `$` wrapper หรือ `{ el, destroy }`. เรียก component เหล่านี้จาก `mount` แล้ว append DOM, คืน cleanup (`() => comp.destroy?.()`). มากกว่านี้ดู `docs/COMPONENTS.md`.

## อยากดู jQuery helper ทั้งหมด
หน้า `docs/JQUERY.md` อธิบาย `$`, `$$`, methods (`on`, `addClass`, `append`, `remove`, ฯลฯ) และ static helper (`$.destroyTree`, `$.delegate`) ว่า router จะ cleanup ยังไง.

## จะ deploy ยังไงให้ service worker ทำงาน
`src/app/sw-register.ts` ลงทะเบียนเฉพาะ `import.meta.env.PROD`: ต้องมี HTTPS (หรือ localhost). ดู `docs/DEPLOY.md` เรื่อง cache scope, forced update และ flag ชั่วคราว (`window.__SW_DISABLED__` ถ้ามี). พูดถึง rewrite + offline caching ใน section “Service worker & offline”.

## ต้องใช้ docs local ยังไง
รัน `npm run docs:dev` เพื่อดู VitePress site, `npm run docs:build` เพื่อ output สแตติก, `npm run docs:preview` เพื่อดู build แล้ว; คำสั่งทั้งหมดอยู่บน `docs/README.md`.
