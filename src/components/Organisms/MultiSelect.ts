import { Chip } from "../Molecules/Chip";
import { Input } from "../Atoms/Input";

export interface MultiSelectOption {
  label: string;
  value: string;
}

export interface MultiSelectOptions {
  choices: MultiSelectOption[];
  selected?: string[];
  placeholder?: string;
  onChange?: (selected: string[]) => void;
}

export interface MultiSelectResult {
  root: HTMLDivElement;
  getSelected(): string[];
  setSelected(values: string[]): void;
}

export function MultiSelect(options: MultiSelectOptions): MultiSelectResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-2");

  const selectedRow = document.createElement("div");
  selectedRow.classList.add("flex", "flex-wrap", "gap-2");

  const input = Input({ placeholder: options.placeholder });
  input.classList.add("w-full");

  const list = document.createElement("div");
  list.classList.add("flex", "flex-col", "gap-1", "border", "rounded-lg", "border-[var(--border)]", "bg-[rgba(0,0,0,.15)]", "p-2");
  list.style.display = "none";

  let selected = new Set(options.selected ?? []);

  const renderSelected = () => {
    selectedRow.innerHTML = "";
    Array.from(selected).forEach((value) => {
      const choice = options.choices.find((item) => item.value === value);
      if (!choice) return;
      const chip = Chip({
        label: choice.label,
        active: true,
        onClick() {
          selected.delete(choice.value);
          renderSelected();
          renderList();
          options.onChange?.(Array.from(selected));
        },
      });
      selectedRow.appendChild(chip);
    });
  };

  const renderList = () => {
    list.innerHTML = "";
    const term = input.value.trim().toLowerCase();
    const filtered = options.choices.filter(
      (choice) =>
        !selected.has(choice.value) &&
        choice.label.toLowerCase().includes(term)
    );
    filtered.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.add("flex", "justify-between", "items-center", "gap-2", "p-2", "rounded-md");
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        selected.add(choice.value);
        renderSelected();
        renderList();
        options.onChange?.(Array.from(selected));
      });
      list.appendChild(button);
    });
    list.style.display = filtered.length ? "flex" : "none";
  };

  input.addEventListener("focus", renderList);
  input.addEventListener("input", renderList);
  input.addEventListener("blur", () => {
    setTimeout(() => {
      list.style.display = "none";
    }, 180);
  });

  root.appendChild(selectedRow);
  root.appendChild(input);
  root.appendChild(list);

  renderSelected();
  renderList();

  return {
    root,
    getSelected: () => Array.from(selected),
    setSelected(values: string[]) {
      selected = new Set(values);
      renderSelected();
      renderList();
      options.onChange?.(Array.from(selected));
    },
  };
}
