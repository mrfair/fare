> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Lifecycle / Auto-cleanup (A–E)

## E) Auto destroy listeners (DOM)
- Route change: `$.destroyTree(host)`
- DOM removal: MutationObserver → `$.destroyTree(removedNode)`

ครอบคลุมเฉพาะ listener ที่ผูกผ่าน `$().on(...)`.

## A–D) Scope helpers
ใน `mount(...)` เรียกได้ตรง ๆ:
- timers: `setTimeout`, `setInterval`
- async: `abortController()`, `fetch()`
- global events: `on(window|document, ...)`
- observers: `observeResize`, `observeMutation`
- utility: `use(fnCleanup)` + `isActive()`

### Example
```js
export function mount({ fetch, on, setInterval, isActive, use }) {
  setInterval(() => console.log("tick"), 1000);

  on(window, "resize", () => console.log("resize"));

  (async () => {
    const data = await (await fetch("/api/health")).json();
    if (!isActive()) return;
    console.log(data);
  })();

  use(() => console.log("cleanup"));
}
```
