import { applyClassAttribute, WithClassAttribute } from "../shared";

export function Select(choices: string[] = [], options: WithClassAttribute = {}): HTMLSelectElement {
  const select = document.createElement("select");
  select.classList.add("input", "w-full", "text-sm");
  for (const choice of choices) {
    const option = document.createElement("option");
    option.value = choice;
    option.textContent = choice;
    select.appendChild(option);
  }
  applyClassAttribute(select, options.class);
  return select;
}
