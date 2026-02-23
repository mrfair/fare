import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface LinkOptions extends WithClassAttribute {
  target?: string;
}

export function Link(href: string, text: string, options: LinkOptions = {}): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.classList.add("link", "font-medium");
  anchor.href = href;
  anchor.textContent = text;
  if (options.target) anchor.target = options.target;
  applyClassAttribute(anchor, options.class);
  return anchor;
}
