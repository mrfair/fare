import template from "./index.html?raw";
import "./index.scss";

import { $ } from "../../app/dom";
import { Button } from "../../components/Atoms/Button";
import { HelperText } from "../../components/Atoms/HelperText";
import { FormField } from "../../components/Molecules/FormField";

export { template };

type LoginContext = {
  root: Element;
};

export function mount({ root }: LoginContext) {
  const slot = $("#loginFormRoot", root);
  if (!slot) return () => {};

  slot.html("");

  const usernameField = FormField({
    label: "Username",
    placeholder: "you@fare.app",
    helperText: "Use your project email or handle",
  });
  const passwordField = FormField({
    label: "Password",
    placeholder: "••••••••",
    type: "password",
    helperText: "Minimum 8 characters",
  });

  const status = HelperText("Enter credentials and submit.", "hint");
  status.setAttribute("aria-live", "polite");

  const submit = Button({ text: "Sign in", variant: "primary" });
  submit.type = "submit";

  const form = document.createElement("form");
  form.classList.add("login-form");
  form.setAttribute("novalidate", "true");
  form.append(
    usernameField.root,
    passwordField.root,
    submit,
    status
  );

  slot.append(form);

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const hasUsername = usernameField.input.value.trim().length > 0;
    const hasPassword = passwordField.input.value.length > 0;

    usernameField.setError(hasUsername ? undefined : "Username is required");
    passwordField.setError(hasPassword ? undefined : "Password is required");

    if (!hasUsername || !hasPassword) {
      status.dataset.state = "error";
      status.textContent = "Please fill both fields.";
      return;
    }

    status.dataset.state = "hint";
    status.textContent = `Welcome back, ${usernameField.input.value.trim()}!`;
  };

  form.addEventListener("submit", handleSubmit);

  return () => {
    form.removeEventListener("submit", handleSubmit);
  };
}
