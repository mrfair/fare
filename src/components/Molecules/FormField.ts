import { Input, InputOptions } from "../Atoms/Input";
import { Label } from "../Atoms/Label";
import { HelperText } from "../Atoms/HelperText";
import { PasswordField } from "./PasswordField";

export interface FormFieldOptions {
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  type?: "text" | "number" | "search" | "password";
  inputOptions?: InputOptions;
}

export interface FormFieldResult {
  root: HTMLDivElement;
  input: HTMLInputElement;
  helper: HTMLParagraphElement;
  setError(message?: string): void;
}

export function FormField(options: FormFieldOptions = {}): FormFieldResult {
  const root = document.createElement("div");
  root.classList.add("form-field");

  if (options.label) {
    const label = Label(options.label);
    root.appendChild(label);
    if (!options.inputOptions) options.inputOptions = {};
  }

  const resolvedType = options.type || options.inputOptions?.type || "text";
  let input: HTMLInputElement;
  if (resolvedType === "password") {
    const passwordField = PasswordField(options.placeholder ?? "Password");
    input = passwordField.input;
    root.appendChild(passwordField.root);
  } else {
    input = Input({
      placeholder: options.placeholder,
      type: resolvedType,
      ...options.inputOptions,
    });
    root.appendChild(input);
  }

  const helper = HelperText(options.helperText ?? "", options.errorText ? "error" : "hint");
  root.appendChild(helper);

  const setError = (message?: string) => {
    if (message) {
      helper.dataset.state = "error";
      helper.textContent = message;
    } else {
      helper.dataset.state = "hint";
      helper.textContent = options.helperText ?? "";
    }
  };

  if (options.errorText) setError(options.errorText);

  return { root, input, helper, setError };
}
