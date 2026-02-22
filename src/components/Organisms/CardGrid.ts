import { Button } from "../Atoms/Button";
import { Heading } from "../Atoms/Text";

export interface CardGridCard {
  title: string;
  body?: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface CardGridOptions {
  cards: CardGridCard[];
}

export function CardGrid(options: CardGridOptions): HTMLDivElement {
  const grid = document.createElement("div");
  grid.classList.add("grid", "gap-4");
  grid.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(220px, 1fr))");

  options.cards.forEach((cardData) => {
    const card = document.createElement("article");
    card.classList.add("flex", "flex-col", "gap-2", "p-4", "border", "rounded-2xl");
    card.style.setProperty("border-color", "var(--border)");
    card.style.setProperty("background", "rgba(255,255,255,.02)");
    if (cardData.badge) {
      const badge = document.createElement("span");
      badge.classList.add("text-xs", "uppercase");
      badge.textContent = cardData.badge;
      card.appendChild(badge);
    }
    const title = Heading(3, cardData.title);
    title.classList.add("m-0");
    card.appendChild(title);
    if (cardData.body) {
      const body = document.createElement("p");
      body.classList.add("text-sm", "text-muted");
      body.textContent = cardData.body;
      body.style.setProperty("color", "var(--muted)");
      body.style.setProperty("margin", "0");
      card.appendChild(body);
    }
    if (cardData.actionLabel) {
      const action = Button({ text: cardData.actionLabel, variant: "secondary" });
      action.addEventListener("click", () => cardData.onAction?.());
      card.appendChild(action);
    }
    grid.appendChild(card);
  });

  return grid;
}
