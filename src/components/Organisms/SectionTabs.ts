import { TabItem } from "../Molecules/TabItem";

export function SectionTabs(labels: string[], onSelect?: (label: string) => void): HTMLDivElement {
  const tabs = document.createElement("div");
  tabs.classList.add("flex", "gap-2", "items-center", "flex-wrap");
  labels.forEach((label, idx) => {
    const tab = TabItem({ label, active: idx === 0 });
    tab.addEventListener("click", () => onSelect?.(label));
    tabs.appendChild(tab);
  });
  return tabs;
}
