import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonOptions {
  text?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string | HTMLElement;
}

export function Button(options: ButtonOptions = {}): HTMLButtonElement {
  const { variant = "primary", loading = false, disabled = false } = options;
  const btn = document.createElement("button");
  btn.type = "button";

  btn.classList.add(
    "btn",
    variant,
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "rounded-lg",
    "px-4",
    "py-2",
    "text-sm",
    "font-medium",
    "focus-ring"
  );

  if (disabled || loading) {
    btn.disabled = true;
    btn.setAttribute("aria-disabled", "true");
  }

  if (loading) {
    btn.setAttribute("aria-busy", "true");
  }

  const fragments: HTMLElement[] = [];

  if (loading) {
    fragments.push(Spinner());
  }

  if (options.icon) {
    const iconNode =
      typeof options.icon === "string" ? Icon(options.icon) : options.icon;
    fragments.push(iconNode);
  }

  if (options.text) {
    const textNode = document.createElement("span");
    textNode.textContent = options.text;
    fragments.push(textNode);
  }

  fragments.forEach((node) => btn.appendChild(node));

  return btn;
}
