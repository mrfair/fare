import { applyClassAttribute, WithClassAttribute } from "../shared";

export type HelperTextVariant = "hint" | "error";

export interface HelperTextOptions extends WithClassAttribute {
  text: string;
  variant?: HelperTextVariant;
}

export function HelperText({ text, variant = "hint", class: classAttr }: HelperTextOptions): HTMLParagraphElement {
  const p = document.createElement("p");
  p.classList.add("helper-text");
  p.dataset.state = variant;
  p.textContent = text;
  applyClassAttribute(p, classAttr);
  return p;
}
