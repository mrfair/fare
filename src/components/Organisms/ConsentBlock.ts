import { Checkbox } from "../Atoms/Toggle";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface ConsentBlockOptions extends WithClassAttribute {
  text: string;
  linkText?: string;
  linkHref?: string;
}

export function ConsentBlock(options: ConsentBlockOptions): HTMLDivElement {
  const root = document.createElement("label");
  root.classList.add("flex", "items-center", "gap-2", "text-sm");
  applyClassAttribute(root, options.class);

  const checkbox = Checkbox();
  root.appendChild(checkbox);

  const span = document.createElement("span");
  span.innerHTML = `${options.text} ${options.linkText ? `<a class="link" href="${options.linkHref ?? "#"}">${options.linkText}</a>` : ""}`;
  root.appendChild(span);

  return root;
}
