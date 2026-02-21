import { ListItem } from "../Molecules/ListItem";

export interface FeatureListSectionOptions {
  features: Array<{ title: string; subtitle?: string }>;
}

export function FeatureListSection(options: FeatureListSectionOptions): HTMLSectionElement {
  const section = document.createElement("section");
  section.classList.add("grid");
  section.style.setProperty("gap", "var(--s-3)");
  section.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(220px, 1fr))");
  options.features.forEach((feature) => {
    const item = ListItem({ title: feature.title, subtitle: feature.subtitle });
    section.appendChild(item.el);
  });
  return section;
}
