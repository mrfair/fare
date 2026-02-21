import { Button } from "../Atoms/Button";

export interface TabItemOptions {
  label: string;
  active?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export function TabItem(options: TabItemOptions): HTMLButtonElement {
  const btn = Button({ text: options.label, variant: options.active ? "primary" : "secondary" });
  if (options.onClick) btn.addEventListener("click", options.onClick);
  return btn;
}
