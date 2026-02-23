import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface AlertOptions extends WithClassAttribute {
  message: string;
  tone?: "info" | "success" | "warn" | "error";
}

export function Alert(options: AlertOptions): HTMLDivElement {
  const el = document.createElement("div");
  el.classList.add("alert");
  el.classList.add(options.tone || "info");
  el.textContent = options.message;
  applyClassAttribute(el, options.class);
  return el;
}
