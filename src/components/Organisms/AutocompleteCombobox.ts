import { Input } from "../Atoms/Input";
import { Icon } from "../Atoms/Icon";

export interface AutocompleteComboboxOptions {
  placeholder?: string;
  suggestions?: string[];
  onSelect?: (value: string) => void;
  onChange?: (value: string) => void;
}

export interface AutocompleteComboboxResult {
  root: HTMLDivElement;
  input: HTMLInputElement;
  setSuggestions(suggestions: string[]): void;
}

export function AutocompleteCombobox(
  options: AutocompleteComboboxOptions = {}
): AutocompleteComboboxResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-1", "w-full", "relative");

  const icon = Icon("⌄");
  icon.classList.add("absolute", "right-3", "top-1/2");
  icon.style.setProperty("transform", "translateY(-50%)");
  icon.style.setProperty("pointer-events", "none");

  const inputWrap = document.createElement("div");
  inputWrap.classList.add("relative", "w-full");

  const input = Input({ placeholder: options.placeholder });
  inputWrap.appendChild(input);
  inputWrap.appendChild(icon);

  const list = document.createElement("div");
  list.classList.add("flex", "flex-col", "gap-1", "w-full", "max-h-48", "overflow-y-auto", "border", "rounded-lg", "border-[var(--border)]", "bg-[rgba(0,0,0,.2)]", "p-2");
  list.style.display = "none";

  let suggestions = options.suggestions ?? [];

  const renderList = (items: string[]) => {
    list.innerHTML = "";
    items.forEach((item) => {
      const row = document.createElement("button");
      row.type = "button";
      row.classList.add("flex", "justify-between", "items-center", "gap-2", "p-2", "rounded-md", "text-left", "text-sm");
      row.textContent = item;
      row.addEventListener("click", () => {
        input.value = item;
        list.style.display = "none";
        options.onSelect?.(item);
      });
      list.appendChild(row);
    });
    list.style.display = items.length ? "flex" : "none";
  };

  const refresh = () => {
    const value = input.value.trim().toLowerCase();
    const filtered = suggestions.filter((item) => item.toLowerCase().includes(value));
    renderList(filtered);
    options.onChange?.(input.value);
  };

  input.addEventListener("input", refresh);
  input.addEventListener("focus", refresh);
  input.addEventListener("blur", () => {
    setTimeout(() => {
      list.style.display = "none";
    }, 180);
  });

  root.appendChild(inputWrap);
  root.appendChild(list);

  renderList(suggestions);

  const setSuggestions = (items: string[]) => {
    suggestions = items;
    renderList(items);
  };

  return { root, input, setSuggestions };
}
