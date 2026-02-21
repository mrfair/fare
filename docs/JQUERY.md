> **Vintage vibe, modern build.**  
*fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# jQuery-like helpers / อ้างอิง `src/app/dom.ts`

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

## MiniQuery helper reference (supported jQuery syntax)
| jQuery equivalent | MiniQuery helper | Notes |
| --- | --- | --- |
| `$(selector)` | `$(selector)` | Returns a Proxy that exposes MiniQuery methods and forwards unknown properties to the wrapped element. |
| `$()` DOM creation | `$( '<button>' )` / `$.create()` | Strings starting with `<` are parsed as template fragments; other strings fall back to query selectors. |
| `.on(type, handler [, options])` | `.on(...)` | Tracks listeners in `__listenerRegistry` so `$.destroyTree()` or router cleanup can remove them. |
| `.off(...)` / `.offAll()` | `.off(...)`, `.offAll()` | Removes specific handlers or all tracked handlers on the element. |
| `.text()` / `.text(value)` | `.text(...)` | Text getter/setter. |
| `.html()` / `.html(value)` | `.html(...)` | Accepts strings, DOM nodes, `$` proxies, or arrays (even nested). |
| `.attr(name)` / `.attr(name, value)` | `.attr(...)` | Get/set attributes. |
| `.addClass()` / `.removeClass()` / `.toggleClass()` | `.addClass(...)` etc. | Splits whitespace-delimited class lists before applying. |
| `.append(...)` / `.appendTo(...)` | `.append(...)` / `.appendTo(...)` | Accepts DOM/strings/arrays; clones when inserting into multiple parents. |
| `.prepend(...)` / `.prependTo(...)` | `.prepend(...)` / `.prependTo(...)` | Similar to `.append` but inserts before existing children. |
| `.before(...)` / `.after(...)` | `.before(...)` / `.after(...)` | Insert relative to the current element. |
| `.closest()` / `.parent()` / `.find()` | `.closest(...)`, `.parent()`, `.find(...)` | Returns another `$` proxy for continued chaining. |
| `.remove()` | `.remove()` | Detaches element and calls `$.destroy()` to clear listeners. |
| Global helpers (`$.on`, `$.delegate`, `$.attr`, etc.) | Same names | Wrappers that operate directly on DOM nodes and still funnel through MiniQuery logic. |

> Unsupported: `.css()`, `.animate()`, collection-wide `.each()`, and other jQuery-specific utilities are not implemented. Check `src/app/dom.ts` for the complete helper list if you need to confirm behavior.

## Event/listener scenarios
- **Simple listener** – `$(selector).on('click', handler)` behaves like jQuery but also records the listener so `$.destroyTree(root)` or route cleanup can invoke `off()` automatically. Call `.off()` when you need to remove a handler early.
- **Delegated listener** – `$.delegate(container, 'click', 'button[data-action]', handler)` wraps the handler and listens on the container. The helper still removes the listener if you save the returned teardown function or when the container is destroyed via `$.destroyTree()`.
- **Auto cleanup flow** – Whenever a route replaces its DOM, call `$.destroyTree(rootElement)` before setting `innerHTML`. That will iterate through the subtree, call `__destroyEl` for each tracked node, and prevent leaks even if nested components failed to call `.off()` manually.
- **Manual teardown** – Use `.offAll()` or `.destroy()` on a specific `$` proxy if you render a temporary widget and want to drop all listeners before removing the element.
- **Batch appending** – Pass arrays or nested `$` constructions to `.append()` / `.html([...])` to mimic jQuery inserting fragment hierarchies. The helper clones nodes when a single source must appear in multiple parents so event bindings stay intact.

## ตัวอย่างการใช้งานที่รับได้ (วิธีเขียนแบบ jQuery)
แม้ว่า `fare` จะไม่รัน jQuery จริง ๆ แต่ helper จะรับ syntax ที่คุ้นเคยหลายอย่าง หากจำเป็นต้องเปลี่ยนการเขียนให้ชัดเจน ให้ใช้ตัวอย่างข้างล่างเป็นแนวทาง:

### การแนบ event listener
```js
// เหมือนกับ jQuery: อีเวนต์จะถูกเก็บไว้ที่ registry ของ MiniQuery
$(selector).on('click', function (event) {
  // handler จะถูกเรียกบน DOM element จริง (this === element)
});
```
`MiniQuery` ติดตาม listener เหล่านี้ และ `$.destroyTree(root)` จะเรียก `off()` ทั้งหมดเมื่อพาธเปลี่ยน จึงไม่จำเป็นต้องจัดการ cleanup เอง

### การป้อน HTML พร้อม content หลายชั้น
```js
$('<div>').html([
  $('<div>').html('hi'),
  document.createTextNode(' และข้อความอื่นๆ')
]);
```
`.html()` จะรับ string, Node, `$()` proxy หรือ array ของรายการเหล่านี้ (รวม nested array) แล้ว append ตามลำดับที่ให้ไว้ หากองค์ประกอบเดียวกันถูกใส่หลายจุด helper จะทำการ clone ให้โดยอัตโนมัติ

> ถ้าคุณพยายามเรียก syntax jQuery ที่ไม่อยู่ใน doc นี้ ให้ตรวจสอบว่าเรามี helper ใน `src/app/dom.ts` หรือพิจารณาระบุตามที่ต้องการ เพราะ API อื่นๆ (เช่น `.animate()`, `.css()` เป็นต้น) จะไม่ทำงาน

## Auto-clean integration
- All `$` listeners are tracked in a WeakMap so `$.destroyTree(host)` wipes them when the router changes layout.
- MutationObserver (see `src/app/auto-destroy-observer.ts`) watches for removed nodes and calls `$.destroyTree` so you don’t have to manually remove DOM unless you want to.
- When a component/route returns `destroy()`, call it before DOM removal to clean anything the helpers cannot auto-handle (timers, observers, custom libs).
