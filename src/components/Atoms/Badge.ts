import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface BadgeOptions extends WithClassAttribute {
  content: string;
  tone?: "neutral" | "success" | "warn" | "error" | "info";
}

export function Badge(options: BadgeOptions): HTMLSpanElement {
  const badge = document.createElement("span");
  badge.classList.add("badge", "font-medium");
  badge.textContent = options.content;
  if (options.tone && options.tone !== "neutral") {
    badge.dataset.tone = options.tone;
  }
  applyClassAttribute(badge, options.class);
  return badge;
}
