import { Input } from "../Atoms/Input";
import { Button } from "../Atoms/Button";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface PasswordFieldOptions extends WithClassAttribute {
  placeholder?: string;
}

export interface PasswordFieldResult {
  root: HTMLDivElement;
  input: HTMLInputElement;
  toggle: HTMLButtonElement;
}

export function PasswordField(options: PasswordFieldOptions = {}): PasswordFieldResult {
  const placeholder = options.placeholder ?? "Password";
  const root = document.createElement("div");
  root.classList.add("input-group");
  applyClassAttribute(root, options.class);

  const input = Input({ type: "password", placeholder });
  root.appendChild(input);

  const toggle = Button({ icon: "👁️", variant: "ghost" });
  root.appendChild(toggle);

  let visible = false;
  toggle.addEventListener("click", () => {
    visible = !visible;
    input.type = visible ? "text" : "password";
  });

  return { root, input, toggle };
}
