> **Vintage vibe, modern build.**  
> *fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Components / คอมโพเนนต์แบบ jQuery-like

## Component = ESM function that returns `$` wrapper
```js
export function bt() {
  return $("<button class='btn'>Click</button>")
    .on("click", () => console.log("click"));
}
```

## Mount
```js
import { bt } from "../components/bt.js";

export function mount({ root }) {
  root.appendChild(bt().get());
}
```

## Auto-destroy
- remove element → MutationObserver auto cleanup listeners (registered via `$().on`)
- ยังควรใช้ scope helpers สำหรับ timer/fetch/observers
