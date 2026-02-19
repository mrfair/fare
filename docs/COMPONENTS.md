> **Vintage vibe, modern build.**  
*fare: route-first vanilla SPA toolkit for jQuery/vanilla devs — no VDOM, no rerender headaches.*

---
# Components / คอมโพเนนต์แบบ jQuery-like

## Component = plain ESM with DOM + helpers
- Components live in `src/components/` (example: `src/components/bt.js`) and usually export a function that returns either:
  - a `$` wrapper (see `<new doc or mention $`), or
  - an object with `{ el, destroy? }` so the caller can mount a real DOM node and clean up listeners.
- Favor lightweight functions that accept a props object, e.g. `{ text = "Click", onClick }`.
- Inside the component, build markup with `$("<button>…")`, attach listeners via `.on()`, and expose `destroy()` if you need manual teardown.

## Consuming components in a route
- Import the component inside `src/routes/.../index.js` and call it from `mount({ root })`.
- Append to a placeholder element (`root.appendChild(comp.el)` or `$("#slot", root).get().appendChild(comp.el)`), then return a cleanup that calls `comp.destroy?.()`.
- Example: `src/routes/component-demo/index.js` mounts `bt({ onClick })` and keeps a counter, then returns `() => b.destroy?.();`.
- Because router replaces DOM via `host.innerHTML = template` before mounting, always attach components after the template is inserted (inside `mount`).

## Cleanup & lifecycle
- Even though `$().on()` listeners are auto-removed by `$.destroyTree`, you should:
  - return `destroy()` from the component or call `use(() => comp.destroy?.())` inside the route scope,
  - clear timers/abort fetches created in the component if they outlive its node,
  - respect `ctx.isActive()` in async callbacks to avoid DOM updates after navigation.
- Use the lifecycle helpers (`setTimeout`, `fetch`, `on`, etc.) in `mount` to piggyback on router cleanup (see `docs/LIFECYCLE.md`).

## Reusability tips
- Keep components focused on DOM + behavior; let routes pass data, callbacks, and configuration.
- Export small APIs (e.g., `bt({ text, onClick })`) so testers can mount them independently of routes.
- Document expected props, emitted events, and required cleanup when the component is reused.

## Reference
- The full `$`/`MiniQuery` API lives in `src/app/dom.ts`—see the new **jQuery-like helpers** page (`docs/JQUERY.md`) for the complete list of supported functions and how they tie into cleanup.
