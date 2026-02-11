> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Lifecycle / Auto-cleanup (A–E)

fare จะดูแล lifecycle ของ route แบบ 3 ชั้น:

1. **Auto-destroy DOM listeners** – เมื่อ router เปลี่ยน route จะเรียก `$.destroyTree(host)` กับ `host` ที่เป็น container ปัจจุบันเพื่อถอด `addEventListener` ที่ผูกผ่าน `$().on(...)` ทั้งหมด ถ้า DOM ถูกลบล้างโดยตรง (เช่น `host.innerHTML = ""`) ก็จะมี MutationObserver แบบ global ที่เรียก `$.destroyTree(removedNode)` ให้โดยอัตโนมัติ
2. **Scope helper ใน mount** – router จะสร้าง scope (`createScope`) และส่ง helper ลงมาด้วย (ดู `src/app/lifecycle.js`). ใน `mount(ctx)` เรียกใช้งานได้ทันที:
   - `setTimeout(...)`, `setInterval(...)` → ไทเมอร์ทั้งหมดจะถูกล้างเมื่อล้าง scope
   - `abortController()` / `fetch(...)` → เชื่อมกับ AbortController เพื่อ abort คำขอเมื่อ route เปลี่ยน
   - `on(target, type, handler)` → ใส่ listener ให้ global target (window, document, media query ฯลฯ) โดย router จะล้างออกให้อัตโนมัติ
   - `observeResize` / `observeMutation` → wrapper รอบ observer อย่าง `ResizeObserver` / `MutationObserver`
   - `use(fnCleanup)` → ลงทะเบียน cleanup อื่น ๆ (เรียกกลับแบบ LIFO) และ `isActive()` → เช็คว่า scope ยังไม่ถูก cleanup เพื่อป้องกัน async หลัง unmount
3. **Manual cleanup** – `mount` สามารถคืนค่า cleanup function (เช่น `return () => controller.abort();`) แล้ว router จะเรียก stack นี้ย้อนกลับก่อน render route ใหม่ (ช่วยจัดการสิ่งที่ scope helper ไม่คลุม เช่น third-party widget)

### ตัวอย่างการใช้ helper ใน mount
```js
export function mount({ fetch, on, setInterval, isActive, use }) {
  const clock = setInterval(() => console.log("tick"), 1000);
  use(() => clearInterval(clock));

  on(window, "resize", () => console.log("resize"));

  (async () => {
    const res = await fetch("/api/health");
    if (!isActive()) return;
    const data = await res.json();
    console.log(data);
  })();

  use(() => console.log("cleanup"));
}
```
ในตัวอย่าง above, `setInterval` ถูกจัดการเป็น scoped timer, listener window จะถูกปลด, fetch จะ abort เองถ้าผู้ใช้เปลี่ยน route ก่อนเสร็จ, และ `use` ช่วยกล่องเอาท์พุตเพิ่มเติมตามใจ
