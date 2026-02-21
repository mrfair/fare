# Molecules

Combine atoms into patterns that are immediately usable.

## A) Field & Input patterns
- **FormField** – `Label`, `Input`, optional hint/error (`HelperText`).
- **SearchField** – `Input` with leading icon, clear action, and optional loader state.
- **PasswordField** – `Input` plus show/hide toggle and helper text.
- **OTPInput** – grouped short inputs (can be reused inside organisms).
- **InputGroup** – `Input` with prefix/suffix slot for currency, `%`, units.

## B) List / option patterns
- **ListItem** – title/subtitle plus optional leading/trailing slot (icon, badge, action).
- **OptionRow** – for dropdown/selector rows (icon, label, right indicator).
- **Chip / Pill** – selectable chip built from `Badge`.
- **BreadcrumbItem** – link + chevron + state.
- **TabItem** – button/tab with active state indicator.

## C) Feedback patterns
- **Alert** – info/success/warn/error states, icon + message + optional action.
- **ToastItem** – compact toast with type-specific color and close action.
- **InlineError** – text-only error message tied to a field.
- **EmptyStateBlock** – icon + message + small CTA.

Design molecules to expose props (text, icon, loading/disabled states) and slot/children hooks for flexibility.
