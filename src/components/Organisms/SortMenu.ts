import { Button } from "../Atoms/Button";

export interface SortMenuOptions {
  label?: string;
  options: string[];
  onSelect?: (value: string) => void;
}

export interface SortMenuResult {
  root: HTMLDivElement;
  setOptions(options: string[]): void;
  setSelected(value: string): void;
}

export function SortMenu(options: SortMenuOptions): SortMenuResult {
  const root = document.createElement("div");
  root.classList.add("relative", "w-full");

  const trigger = Button({ text: options.label || "Sort", variant: "ghost" });
  trigger.classList.add("w-full");

  const list = document.createElement("div");
  list.classList.add("absolute", "z-10", "left-0", "right-0", "mt-2", "flex", "flex-col", "gap-1", "border", "rounded-lg", "bg-[rgba(11,16,32,.95)]", "border-[var(--border)]", "p-2");
  list.style.display = "none";

  let current = options.options[0];

  const renderList = (items: string[]) => {
    list.innerHTML = "";
    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add(
        "text-left",
        "px-3",
        "py-2",
        "rounded-md",
        "text-sm",
        "w-full"
      );
      btn.style.setProperty("color", item === current ? "var(--accent)" : "var(--text)");
      btn.textContent = item;
      btn.addEventListener("click", () => {
        current = item;
        trigger.textContent = `Sort: ${current}`;
        options.onSelect?.(current);
        list.style.display = "none";
      });
      list.appendChild(btn);
    });
  };

  renderList(options.options);

  trigger.addEventListener("click", () => {
    list.style.display = list.style.display === "none" ? "flex" : "none";
  });

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target as Node)) {
      list.style.display = "none";
    }
  });

  trigger.textContent = `Sort: ${current}`;

  root.appendChild(trigger);
  root.appendChild(list);

  return {
    root,
    setOptions(items: string[]) {
      renderList(items);
    },
    setSelected(value: string) {
      current = value;
      trigger.textContent = `Sort: ${current}`;
      renderList(options.options);
    },
  };
}
