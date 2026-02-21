function primitiveToggle(type: string): HTMLInputElement {
  const input = document.createElement("input");
  input.type = type;
  input.classList.add("focus-ring");
  return input;
}

export function Checkbox(): HTMLInputElement {
  return primitiveToggle("checkbox");
}

export function Radio(): HTMLInputElement {
  return primitiveToggle("radio");
}

export function Switch(): HTMLInputElement {
  const toggle = primitiveToggle("checkbox");
  toggle.dataset.role = "switch";
  return toggle;
}
