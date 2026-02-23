import { applyClassAttribute, WithClassAttribute } from "../shared";

function primitiveToggle(type: string, options: WithClassAttribute = {}): HTMLInputElement {
  const input = document.createElement("input");
  input.type = type;
  input.classList.add("focus-ring");
  applyClassAttribute(input, options.class);
  return input;
}

export function Checkbox(options: WithClassAttribute = {}): HTMLInputElement {
  return primitiveToggle("checkbox", options);
}

export function Radio(options: WithClassAttribute = {}): HTMLInputElement {
  return primitiveToggle("radio", options);
}

export function Switch(options: WithClassAttribute = {}): HTMLInputElement {
  const toggle = primitiveToggle("checkbox", options);
  toggle.dataset.role = "switch";
  return toggle;
}
