export interface BreadcrumbItemOptions {
  label: string;
  href?: string;
  active?: boolean;
}

import { Link } from "../Atoms/Link";
import { Text } from "../Atoms/Text";

export function BreadcrumbItem(options: BreadcrumbItemOptions): HTMLAnchorElement {
  const anchor = Link(options.href ?? "#", options.label);
  if (options.active) anchor.classList.add("active");
  return anchor;
}
