import { ListItem } from "../Molecules/ListItem";
import { Heading } from "../Atoms/Text";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface SectionedListSection {
  title: string;
  items: { title: string; subtitle?: string }[];
}

export function SectionedList(
  sections: SectionedListSection[],
  options: WithClassAttribute = {}
): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-4");
  applyClassAttribute(root, options.class);

  sections.forEach((section) => {
    const header = Heading(3, section.title);
    header.classList.add("m-0");
    root.appendChild(header);
    section.items.forEach((item) => {
      const listItem = ListItem({ title: item.title, subtitle: item.subtitle });
      root.appendChild(listItem.el);
    });
  });

  return root;
}
