import template from "./index.html?raw";
import "./index.scss";

import { $ } from "../../app/dom.ts";
import { Button } from "../../components/Atoms/Button";
import { HelperText } from "../../components/Atoms/HelperText";
import { Heading, Text } from "../../components/Atoms/Text";
import { FormField } from "../../components/Molecules/FormField";
import { PasswordField } from "../../components/Molecules/PasswordField";

type LoginContext = {
  root: Element;
};

export { template };

export function mount({ root }: LoginContext) {
  const slot = $("#loginCardRoot", root);
  if (!slot) return () => {};
  slot.innerHTML = "";

  const heading = Heading(2, "Welcome back to Fare");
  heading.classList.add("m-0");

  const subtitle = Text("Sign in with your username and password.");
  subtitle.classList.add("text-sm");
  subtitle.style.setProperty("color", "var(--muted)");
  subtitle.style.setProperty("margin", "0");

  const usernameField = FormField({
    label: "Username",
    placeholder: "your.username",
  });
  const passwordField = FormField({
    label: "Password",
    placeholder: "your.password",
    type: "password",
  });

  const status = HelperText("Use the form to continue.", "hint");
  status.style.setProperty("margin", "0");

  const submit = Button({ text: "Sign in", variant: "primary" });
  submit.type = "submit";
  submit.classList.add("w-full");

  const form = document.createElement("form");
  form.classList.add("flex", "flex-col", "gap-3");
  form.setAttribute("novalidate", "true");
  form.appendChild(heading);
  form.appendChild(subtitle);
  form.appendChild(usernameField.root);
  form.appendChild(passwordField.root);
  form.appendChild(status);
  form.appendChild(submit);

  const card = document.createElement("article");
  card.classList.add("flex", "flex-col", "gap-4", "w-full");
  card.style.setProperty("padding", "var(--s-5)");
  card.style.setProperty("border-radius", "var(--r-2xl)");
  card.style.setProperty("background", "rgba(255,255,255,.04)");
  card.style.setProperty("border", "1px solid var(--border)");
  card.style.setProperty("box-shadow", "var(--sh-md)");
  card.appendChild(form);

  slot.appendChild(card);

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const username = usernameField.input.value.trim();
    const password = passwordField.input.value;
    if (!username || !password) {
      status.dataset.state = "error";
      status.textContent = "Both username and password are required.";
      return;
    }
    status.dataset.state = "hint";
    status.textContent = `Welcome back, ${username}!`;
  };

  form.addEventListener("submit", handleSubmit);

  return () => {
    form.removeEventListener("submit", handleSubmit);
  };
}
