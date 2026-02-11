> **Vintage vibe, modern build.**  
*fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# jQuery-like helpers / อ้างอิง `src/app/dom.js`

fare ไม่ดึง jQuery จริง ๆ แต่สร้าง wrapper เล็ก ๆ (`MiniQuery`) ที่ให้ syntax เดิมกับ chainable DOM/evt helpers และ sync teardown.

## Selectors & creation
- `$(selector, [ctx])` คืน Proxy ที่ห่อ Element, method แบบ chainable และส่งต่อ property/method ที่ไม่รู้จักให้ DOM element จริง (เช่น `.textContent`).
- `$$` คืน real `Element[]` จาก `querySelectorAll`.
- String ที่ขึ้นต้นด้วย `<` จะถูกแปลงเป็น element ใหม่ (`$("<button>")`), ถ้า string ธรรมดาจะกลายเป็น text node เมื่อใช้ helper insertion (ex: `append`).

## Chainable methods
`${$(selector)}` โปรดคิดว่าเป็น jQuery-lite; เมธอดทุกตัวคืน `this` เพื่อ chain:
  - `.on(type, handler, options)` / `.off()` / `.offAll()` / `.destroy()` – ติดและล้าง event listener (Auto-destroy registry tracking กับ `$.destroyTree`)
  - `.text(value)` / `.html(value)` – อ่าน/เขียน content
  - `.attr(name, value)` – อ่าน/เขียน attributes
  - `.addClass(...names)` / `.removeClass(...names)` / `.toggleClass(name, force)` – classList helpers
  - `.append(...content)` / `.appendTo(target)` / `.prepend(...content)` / `.prependTo(target)` / `.before(...content)` / `.after(...content)` – DOM insertion (รับ Node, `$`, string, array)
  - `.closest(selector)` / `.parent()` / `.find(selector)` – DOM traversal returning `$` again
  - `.remove()` – takes element out of DOM and runs `$.destroy` on it

## Static helpers
- `$.on(el, type, handler)` / `$.delegate(el, type, selector, handler)` – old-style helpers (still tracked for cleanup)
- `$.create(html)` – template-based element creation
- `.attr/.addClass/.removeClass/.toggleClass/.text/.html` helper wrappers that forward to `$(el)`
- `$.destroyTree(container)` / `$.destroy(el)` – clear listeners for `$().on()` within subtree (used by router before swapping DOM)

## Best practice
- **Prefer `$(root).on()`** so router can auto-destroy listeners and keep cleanup predictable.
- When inserting content, pass `$` objects to `.append`/`.before` (the helper clones when appending to multiple parents). You can mix DOM nodes, strings, arrays, and proxies.
- Use `.find()` / `.parent()` instead of raw `querySelector` when you need chainability, so you can keep using helper methods on the returned node.
- `.remove()` calls `$.destroy` internally; use it when you want to both detach and drop listeners.
- There is no `.css()` helper anymore; manipulate styling via `.attr("style", ...)`, CSS classes, or `.style` on the proxied element.

## Auto-clean integration
- All `$` listeners are tracked in a WeakMap so `$.destroyTree(host)` wipes them when the router changes layout.
- MutationObserver (see `src/app/auto-destroy-observer.js`) watches for removed nodes and calls `$.destroyTree` so you don’t have to manually remove DOM unless you want to.
- When a component/route returns `destroy()`, call it before DOM removal to clean anything the helpers cannot auto-handle (timers, observers, custom libs).
