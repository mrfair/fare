import { Button } from "../Atoms/Button";
import { WithClassAttribute } from "../shared";

export interface TabItemOptions extends WithClassAttribute {
  label: string;
  active?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export function TabItem(options: TabItemOptions): HTMLButtonElement {
  const btn = Button({
    text: options.label,
    variant: options.active ? "primary" : "secondary",
    class: options.class,
  });
  if (options.onClick) btn.addEventListener("click", options.onClick);
  return btn;
}
