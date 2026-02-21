import { ListItem } from "../Molecules/ListItem";
import { Button } from "../Atoms/Button";

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export function PricingTableSection(tiers: PricingTier[]): HTMLSectionElement {
  const section = document.createElement("section");
  section.classList.add("grid");
  section.style.setProperty("gap", "var(--s-4)");
  section.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(220px, 1fr))");

  tiers.forEach((tier) => {
    const card = document.createElement("div");
    card.classList.add("border", "rounded-xl", "p-4", "flex", "flex-col", "gap-4");
    card.style.setProperty("border-color", "var(--border)");
    card.style.setProperty("background", "rgba(255,255,255,.02)");
    if (tier.highlighted) {
      card.style.setProperty("border-color", "var(--accent)");
      card.style.setProperty("background", "rgba(124,92,255,.08)");
      card.style.setProperty("box-shadow", "0 10px 30px rgba(124,92,255,.25)");
    }

    const header = document.createElement("div");
    header.classList.add("flex", "items-baseline", "justify-between", "gap-3");
    const title = document.createElement("strong");
    title.textContent = tier.name;
    const price = document.createElement("span");
    price.textContent = tier.price;
    header.appendChild(title);
    header.appendChild(price);
    card.appendChild(header);

    tier.features.forEach((feature) => {
      const item = ListItem({ title: feature });
      card.appendChild(item.el);
    });

    const cta = Button({ text: "Select" });
    card.appendChild(cta);
    section.appendChild(card);
  });

  return section;
}
