import { Input } from "../Atoms/Input";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface InputGroupOptions extends WithClassAttribute {
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}

export interface InputGroupResult {
  root: HTMLDivElement;
  input: HTMLInputElement;
}

export function InputGroup(options: InputGroupOptions = {}): InputGroupResult {
  const root = document.createElement("div");
  root.classList.add("input-group");
  applyClassAttribute(root, options.class);

  if (options.prefix) {
    const prefix = document.createElement("span");
    prefix.classList.add("prefix");
    prefix.textContent = options.prefix;
    root.appendChild(prefix);
  }

  const input = Input({ placeholder: options.placeholder });
  root.appendChild(input);

  if (options.suffix) {
    const suffix = document.createElement("span");
    suffix.classList.add("suffix");
    suffix.textContent = options.suffix;
    root.appendChild(suffix);
  }

  return { root, input };
}
