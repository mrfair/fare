import { ListItem } from "../Molecules/ListItem";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface FeatureListSectionOptions extends WithClassAttribute {
  features: Array<{ title: string; subtitle?: string }>;
}

export function FeatureListSection(options: FeatureListSectionOptions): HTMLSectionElement {
  const section = document.createElement("section");
  section.classList.add("grid");
  section.style.setProperty("gap", "var(--s-3)");
  section.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(220px, 1fr))");
  applyClassAttribute(section, options.class);
  options.features.forEach((feature) => {
    const item = ListItem({ title: feature.title, subtitle: feature.subtitle });
    section.appendChild(item.el);
  });
  return section;
}
