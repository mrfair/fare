> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Caching / การแคช

## Code splitting
Routes = dynamic import → chunk แยกตาม route (cache ดี)

## CSS split
route import `index.scss` → build เป็น CSS แยก

## Service Worker
แนวทางทั่วไป:
- assets: cache-first
- navigation: network-first + offline fallback
- same-origin: stale-while-revalidate
