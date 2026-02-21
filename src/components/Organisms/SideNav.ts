import { Link } from "../Atoms/Link";

export interface SideNavOptions {
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
  options.items.forEach((item) => {
    const link = Link(item.href, item.label);
    link.classList.add("text-sm", "font-medium");
    link.style.setProperty("color", item.active ? "var(--text)" : "var(--muted)");
    nav.appendChild(link);
  });
  return nav;
}
