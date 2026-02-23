import { Input } from "../Atoms/Input";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface OTPInputOptions extends WithClassAttribute {
  length?: number;
  separator?: string;
}

export interface OTPInputResult {
  container: HTMLDivElement;
  inputs: HTMLInputElement[];
  value(): string;
  focus(): void;
}

export function OTPInput(options: OTPInputOptions = {}): OTPInputResult {
  const length = options.length || 4;
  const container = document.createElement("div");
  container.classList.add("input-group");
  applyClassAttribute(container, options.class);

  const inputs: HTMLInputElement[] = [];
  for (let i = 0; i < length; i += 1) {
    const input = Input({
      type: "text",
    });
    input.maxLength = 1;
    input.inputMode = "numeric";
    input.classList.add("otp-cell");
    input.addEventListener("input", () => {
      if (input.value && i < length - 1) {
        inputs[i + 1].focus();
      }
    });
    inputs.push(input);
    container.appendChild(input);
  }

  const value = () => inputs.map((field) => field.value).join("");
  const focus = () => inputs[0].focus();

  return { container, inputs, value, focus };
}
