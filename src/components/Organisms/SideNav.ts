import { Link } from "../Atoms/Link";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface SideNavOptions extends WithClassAttribute {
  items: Array<{ label: string; href: string; active?: boolean }>;
}

export function SideNav(options: SideNavOptions): HTMLDivElement {
  const nav = document.createElement("div");
  nav.classList.add("flex", "flex-col", "gap-3");
  nav.style.setProperty("width", "240px");
  nav.style.setProperty("background", "rgba(11,16,32,.8)");
  nav.style.setProperty("border-right", "1px solid var(--border)");
  nav.style.setProperty("padding", "var(--s-4)");
  nav.style.setProperty("min-height", "100vh");
  applyClassAttribute(nav, options.class);
  options.items.forEach((item) => {
    const link = Link(item.href, item.label);
    link.classList.add("text-sm", "font-medium");
    link.style.setProperty("color", item.active ? "var(--text)" : "var(--muted)");
    nav.appendChild(link);
  });
  return nav;
}
