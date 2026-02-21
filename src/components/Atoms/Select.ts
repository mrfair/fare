export function Select(choices: string[] = []): HTMLSelectElement {
  const select = document.createElement("select");
  select.classList.add("input", "w-full", "text-sm");
  for (const choice of choices) {
    const option = document.createElement("option");
    option.value = choice;
    option.textContent = choice;
    select.appendChild(option);
  }
  return select;
}
