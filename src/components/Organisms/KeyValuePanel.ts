export interface KeyValuePanelItem {
  label: string;
  value: string;
}

export function KeyValuePanel(items: KeyValuePanelItem[]): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("grid", "grid-cols-2", "gap-3");

  items.forEach((item) => {
    const label = document.createElement("span");
    label.classList.add("text-xs", "uppercase");
    label.style.setProperty("color", "var(--muted)");
    label.textContent = item.label;
    const value = document.createElement("span");
    value.classList.add("text-sm");
    value.textContent = item.value;
    const wrapper = document.createElement("div");
    wrapper.classList.add("flex", "flex-col", "gap-1");
    wrapper.appendChild(label);
    wrapper.appendChild(value);
    root.appendChild(wrapper);
  });

  return root;
}
