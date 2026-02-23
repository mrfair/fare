import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface LabelOptions extends WithClassAttribute {
  htmlFor?: string;
}

export function Label(text: string, options: LabelOptions = {}): HTMLLabelElement {
  const label = document.createElement("label");
  label.classList.add("text-sm", "font-medium");
  label.textContent = text;
  if (options.htmlFor) label.htmlFor = options.htmlFor;
  applyClassAttribute(label, options.class);
  return label;
}
