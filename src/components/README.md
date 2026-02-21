# Component Architecture

We follow Atomic Design. Each tier lives under `Atoms/`, `Molecules/`, and `Organisms/`,
with README guides (per your latest spec) so the component hierarchy stays stable.

1. **Atoms** – design tokens and primitive UI controls (text, buttons, badges, form inputs).
2. **Molecules** – composed patterns that group atoms into useful widgets (search fields,
   chip rows, alerts, etc.).
3. **Organisms** – sections/areas (headers, shells, feeds, overlays, system states). They may
   include light behavior (open/close, fetching state) but should remain configurable/slot-based.

Don’t let dependencies jump tiers—organisms build from molecules, molecules from atoms.

## Utility-first styling

- **Always scan `src/app/mini-tailwind.css` first.** Most layouts should be expressed by combining its existing utility classes (`flex`, `gap`, `p-*`, `rounded-*`, etc.) before introducing a new selector.
- **Only add a bespoke class when the utility set genuinely cannot capture the layout or state you need.** When you do create a new class, define it in a shared stylesheet (preferably `mini-tailwind.css` so tokens stay centralized) and call that out in whichever README or route uses it.
- **Treat this guide as the gatekeeper.** Whenever you touch a route or component, double-check this README so new styles follow the utility-first rule and we avoid drift.
