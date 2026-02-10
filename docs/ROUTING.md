> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Routing / ระบบ Route

## File-based routing
โฟลเดอร์ใน `src/routes/` = path ของ route

- `src/routes/root` → `/`
- `src/routes/about` → `/about`
- `src/routes/users/[id]` → `/users/:id`

## Nested layouts
ใน `index.html` ของ layout ใส่:
```html
<div data-outlet></div>
```

## Guards (401/403/404)
Route module สามารถ export:
- `requiresAuth = true`
- `roles = ["admin"]`
หรือ export `guard(ctx)`

## Cleanup
เมื่อเปลี่ยนหน้า router จะ:
1) เรียก cleanup ของ route เก่า
2) `$.destroyTree(host)` + MutationObserver auto-destroy (listener ที่ผูกด้วย `$().on`)
3) scope cleanup (timers/fetch/global listeners/observers)

> **Rule:** bind event ผ่าน `$().on` เพื่อให้ auto-destroy ครอบคลุม
