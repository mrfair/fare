import { TabItem } from "../Molecules/TabItem";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export function SectionTabs(
  labels: string[],
  onSelect?: (label: string) => void,
  options: WithClassAttribute = {}
): HTMLDivElement {
  const tabs = document.createElement("div");
  tabs.classList.add("flex", "gap-2", "items-center", "flex-wrap");
  applyClassAttribute(tabs, options.class);
  labels.forEach((label, idx) => {
    const tab = TabItem({ label, active: idx === 0 });
    tab.addEventListener("click", () => onSelect?.(label));
    tabs.appendChild(tab);
  });
  return tabs;
}
