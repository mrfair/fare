import { BreadcrumbItem } from "../Molecules/BreadcrumbItem";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export function BreadcrumbBar(
  paths: Array<{ label: string; href?: string }>,
  options: WithClassAttribute = {}
): HTMLDivElement {
  const bar = document.createElement("div");
  bar.classList.add("flex", "gap-2", "items-center", "flex-wrap");
  applyClassAttribute(bar, options.class);
  paths.forEach((path, idx) => {
    const item = BreadcrumbItem({ label: path.label, href: path.href });
    bar.appendChild(item);
    if (idx < paths.length - 1) {
      const sep = document.createElement("span");
      sep.textContent = ">";
      sep.classList.add("text-sm");
      sep.style.setProperty("color", "var(--muted)");
      bar.appendChild(sep);
    }
  });
  return bar;
}
