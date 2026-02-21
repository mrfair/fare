import { Text } from "../Atoms/Text";
import { Icon } from "../Atoms/Icon";

export interface OptionRowOptions {
  label: string;
  description?: string;
  icon?: string | HTMLElement;
  selected?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export interface OptionRowResult {
  el: HTMLDivElement;
}

export function OptionRow(options: OptionRowOptions): OptionRowResult {
  const el = document.createElement("div");
  el.classList.add("list-item", "gap-2");
  if (options.selected) {
    el.dataset.state = "selected";
    el.style.backgroundColor = "rgba(124,92,255,.08)";
  }

  if (options.icon) {
    const iconWrap = Icon(typeof options.icon === "string" ? options.icon : "★");
    if (options.icon instanceof HTMLElement) {
      iconWrap.replaceWith(options.icon);
    }
    el.appendChild(iconWrap);
  }

  el.appendChild(Text(options.label));

  if (options.description) {
    const desc = document.createElement("span");
    desc.classList.add("meta");
    desc.appendChild(Text(options.description));
    el.appendChild(desc);
  }

  if (options.onClick) {
    el.addEventListener("click", options.onClick);
  }

  return { el };
}
