import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface InputOptions extends WithClassAttribute {
  type?: "text" | "number" | "search";
  placeholder?: string;
  value?: string;
  disabled?: boolean;
}

export function Input(options: InputOptions = {}): HTMLInputElement {
  const input = document.createElement("input");
  input.classList.add("input", "w-full", "text-sm");
  input.type = options.type || "text";
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.value) input.value = options.value;
  if (options.disabled) input.disabled = true;
  applyClassAttribute(input, options.class);
  return input;
}
