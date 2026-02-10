> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# FAQ

## Refresh แล้ว 404
ตั้ง SPA rewrite (ดู `DEPLOY.md`)

## Auto-destroy ครอบคลุมแค่ไหน
ครอบคลุมเฉพาะ listener ที่ผูกผ่าน `$().on(...)`  
timer/fetch/observer ใช้ scope helpers

## ทำไมไม่ใช้ VDOM
fare เน้น event-driven UI แบบตรงไปตรงมา → ลด rerender/state sync issues
