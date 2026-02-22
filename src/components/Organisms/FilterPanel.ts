import { Button } from "../Atoms/Button";

export interface FilterPanelFacet {
  title: string;
  options: string[];
}

export interface FilterPanelOptions {
  facets: FilterPanelFacet[];
  onApply?: (selections: Record<string, string[]>) => void;
  onReset?: () => void;
}

export interface FilterPanelResult {
  root: HTMLDivElement;
  getSelections(): Record<string, string[]>;
  reset(): void;
}

export function FilterPanel(options: FilterPanelOptions): FilterPanelResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-4", "w-full");

  const selections: Record<string, Set<string>> = {};

  const renderFacet = (facet: FilterPanelFacet) => {
    const node = document.createElement("div");
    node.classList.add("flex", "flex-col", "gap-2");
    const label = document.createElement("strong");
    label.textContent = facet.title;
    node.appendChild(label);

    const optionRow = document.createElement("div");
    optionRow.classList.add("flex", "flex-wrap", "gap-2");

    const state = selections[facet.title] || new Set<string>();
    selections[facet.title] = state;

    facet.options.forEach((option) => {
      const badge = document.createElement("button");
      badge.type = "button";
      badge.classList.add("rounded-full", "px-3", "py-1", "text-sm", "border");
      badge.style.setProperty("border-color", "var(--border)");
      badge.style.setProperty("background", "rgba(255,255,255,.03)");
      badge.textContent = option;
      const sync = () => {
        if (state.has(option)) {
          badge.style.setProperty("background", "rgba(124,92,255,.25)");
          badge.style.setProperty("border-color", "rgba(124,92,255,.55)");
          badge.style.setProperty("color", "#fff");
        } else {
          badge.style.setProperty("background", "rgba(255,255,255,.03)");
          badge.style.setProperty("border-color", "var(--border)");
          badge.style.setProperty("color", "var(--text)");
        }
      };
      sync();
      badge.addEventListener("click", () => {
        if (state.has(option)) {
          state.delete(option);
        } else {
          state.add(option);
        }
        sync();
      });
      optionRow.appendChild(badge);
    });

    node.appendChild(optionRow);
    return node;
  };

  options.facets.forEach((facet) => {
    root.appendChild(renderFacet(facet));
  });

  const actions = document.createElement("div");
  actions.classList.add("flex", "gap-2", "flex-wrap");

  const applyBtn = Button({ text: "Apply filters", variant: "primary" });
  const resetBtn = Button({ text: "Reset", variant: "ghost" });

  applyBtn.addEventListener("click", () => {
    const payload: Record<string, string[]> = {};
    Object.entries(selections).forEach(([key, set]) => {
      payload[key] = Array.from(set);
    });
    options.onApply?.(payload);
  });

  resetBtn.addEventListener("click", () => {
    Object.values(selections).forEach((set) => set.clear());
    Array.from(root.querySelectorAll("button")).forEach((button) => {
      if (button === applyBtn || button === resetBtn) return;
      button.style.removeProperty("background");
      button.style.removeProperty("border-color");
      button.style.setProperty("color", "var(--text)");
    });
    options.onReset?.();
  });

  actions.appendChild(applyBtn);
  actions.appendChild(resetBtn);
  root.appendChild(actions);

  return {
    root,
    getSelections: () =>
      Object.fromEntries(
        Object.entries(selections).map(([key, value]) => [key, Array.from(value)])
      ),
    reset: () => {
      Object.values(selections).forEach((set) => set.clear());
      Array.from(root.querySelectorAll("button")).forEach((button) => {
        if (button === applyBtn || button === resetBtn) return;
        button.style.removeProperty("background");
        button.style.removeProperty("border-color");
        button.style.setProperty("color", "var(--text)");
      });
    },
  };
}
