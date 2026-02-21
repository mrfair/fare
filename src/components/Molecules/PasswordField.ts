import { Input } from "../Atoms/Input";
import { Icon } from "../Atoms/Icon";
import { Button } from "../Atoms/Button";

export interface PasswordFieldResult {
  root: HTMLDivElement;
  input: HTMLInputElement;
  toggle: HTMLButtonElement;
}

export function PasswordField(placeholder = "Password"): PasswordFieldResult {
  const root = document.createElement("div");
  root.classList.add("input-group");

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
