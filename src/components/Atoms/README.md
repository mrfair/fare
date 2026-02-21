# Atoms

Primitive UI building blocks + tokens. Keep these focused on look/feel and expose props only for
APIs that molecules depend on.

## 1) Design Tokens (required)
- **Colors**: neutral palette plus semantic success/warn/error/info states.
- **Typography**: base font family, scale, weights, line-heights (use runtime tokens).
- **Spacing scale**: already defined via `--s-*`.
- **Radius scale**: `--r-*` tokens.
- **Shadow scale**: `--sh-*`.
- **Border width**: `--b-*`.
- **Breakpoints**: define responsive mixins/variables if needed.
- **Z-index layers**: tokens for dropdown/modal/toast stacking.

## 2) Primitive atoms
- **Text / Heading** – typographic wrappers that pull from the token scale.
- **Icon** – inline SVG wrapper accepting size/label.
- **Link** – styled anchor with focus and optional icon.
- **Button** – variants (primary, secondary, ghost) plus disabled/loading states.
- **Badge / Tag** – pill/chip labels for statuses.
- **Avatar** – circular image/initial fallback.
- **Divider** – horizontal/vertical rules.
- **Spinner** – animated loader.
- **Skeleton** – placeholder rectangle/lines.

## 3) Form atoms
- **Label** – associates with inputs.
- **Input** – text/number/search, accepts adornments via slots.
- **Textarea** – multi-line input.
- **Checkbox**, **Radio**, **Switch** – boolean controls with focusable labels.
- **Select (basic)** – native-style dropdown wrapper.
- **HelperText** / **ErrorText** – contextual messaging tied to inputs.

Atoms should remain stateless and reusable; molecules build functionality on top of them.
