import { Text } from "../Atoms/Text";
import { Icon } from "../Atoms/Icon";
import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface OptionRowOptions extends WithClassAttribute {
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
  applyClassAttribute(el, options.class);
  if (options.selected) {
    el.dataset.state = "selected";
    el.style.backgroundColor = "rgba(124,92,255,.08)";
  }

  if (options.icon) {
    if (typeof options.icon === "string") {
      const iconWrap = Icon({ content: options.icon });
      el.appendChild(iconWrap);
    } else {
      el.appendChild(options.icon);
    }
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
