import { Input } from "../Atoms/Input";
import { Icon } from "../Atoms/Icon";
import { Button } from "../Atoms/Button";

export interface SearchFieldOptions {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export interface SearchFieldResult {
  el: HTMLDivElement;
  input: HTMLInputElement;
  clear(): void;
}

export function SearchField(options: SearchFieldOptions = {}): SearchFieldResult {
  const el = document.createElement("div");
  el.classList.add("search-field");

  const icon = Icon("🔍");
  el.appendChild(icon);

  const input = Input({ type: "search", placeholder: options.placeholder });
  el.appendChild(input);

  const clearButton = Button({ text: "Clear", variant: "ghost" });
  el.appendChild(clearButton);

  const triggerSearch = () => {
    options.onSearch?.(input.value.trim());
  };

  input.addEventListener("keyup", (event) => {
    if (event.key === "Enter") triggerSearch();
  });

  clearButton.addEventListener("click", () => {
    input.value = "";
    triggerSearch();
  });

  return {
    el,
    input,
    clear: () => {
      input.value = "";
    },
  };
}
