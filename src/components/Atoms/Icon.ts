import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface IconOptions extends WithClassAttribute {
  content: string;
}

export function Icon({ content, class: classAttr }: IconOptions): HTMLSpanElement {
  const icon = document.createElement("span");
  icon.classList.add("icon");
  icon.innerHTML = content;
  applyClassAttribute(icon, classAttr);
  return icon;
}
