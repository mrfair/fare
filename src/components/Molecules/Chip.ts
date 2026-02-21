import { Button } from "../Atoms/Button";

export interface ChipOptions {
  label: string;
  active?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export function Chip(options: ChipOptions): HTMLButtonElement {
  const variant = options.active ? "secondary" : "ghost";
  const btn = Button({ text: options.label, variant });
  btn.classList.add("rounded-full", "px-3", "py-1", "gap-1");
  if (options.active) {
    btn.setAttribute("aria-pressed", "true");
  }
  if (options.onClick) btn.addEventListener("click", options.onClick);
  return btn;
}
