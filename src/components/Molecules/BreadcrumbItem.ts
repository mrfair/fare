import { Link } from "../Atoms/Link";
import { WithClassAttribute } from "../shared";

export interface BreadcrumbItemOptions extends WithClassAttribute {
  label: string;
  href?: string;
  active?: boolean;
}

export function BreadcrumbItem(options: BreadcrumbItemOptions): HTMLAnchorElement {
  const anchor = Link(options.href ?? "#", options.label, { class: options.class });
  if (options.active) anchor.classList.add("active");
  return anchor;
}
