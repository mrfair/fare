export interface StatsCard {
  label: string;
  value: string;
  trend?: string;
}

export function StatsCardsRow(cards: StatsCard[]): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("grid", "gap-4");
  root.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(180px, 1fr))");

  cards.forEach((card) => {
    const wrapper = document.createElement("article");
    wrapper.classList.add("flex", "flex-col", "gap-1", "p-4", "border", "rounded-2xl");
    wrapper.style.setProperty("border-color", "var(--border)");
    wrapper.style.setProperty("background", "rgba(255,255,255,.02)");

    const value = document.createElement("span");
    value.classList.add("text-2xl", "font-semibold");
    value.textContent = card.value;
    const label = document.createElement("span");
    label.classList.add("text-xs");
    label.style.setProperty("color", "var(--muted)");
    label.textContent = card.label;
    wrapper.appendChild(value);
    wrapper.appendChild(label);
    if (card.trend) {
      const trend = document.createElement("span");
      trend.classList.add("text-xs");
      trend.style.setProperty("color", "var(--accent)");
      trend.textContent = card.trend;
      wrapper.appendChild(trend);
    }
    root.appendChild(wrapper);
  });

  return root;
}
