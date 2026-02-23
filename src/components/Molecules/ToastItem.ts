import { Alert } from "./Alert";
import { Button } from "../Atoms/Button";
import { WithClassAttribute } from "../shared";

export interface ToastItemOptions extends WithClassAttribute {
  message: string;
  tone?: "info" | "success" | "warn" | "error";
  onClose?: () => void;
}

export function ToastItem(options: ToastItemOptions): HTMLDivElement {
  const el = Alert({
    message: options.message,
    tone: options.tone,
    class: options.class,
  });
  el.classList.add("flex", "justify-between", "items-center", "gap-3");

  if (options.onClose) {
    const close = Button({ text: "×", variant: "ghost" });
    close.addEventListener("click", () => {
      options.onClose?.();
      el.remove();
    });
    el.appendChild(close);
  }

  return el;
}
