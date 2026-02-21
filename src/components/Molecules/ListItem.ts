import { Text } from "../Atoms/Text";

export interface ListItemOptions {
  title: string;
  subtitle?: string;
  leading?: string | HTMLElement;
  trailing?: string | HTMLElement;
}

export interface ListItemResult {
  el: HTMLDivElement;
  leadingSlot?: HTMLElement;
  trailingSlot?: HTMLElement;
}

export function ListItem(options: ListItemOptions): ListItemResult {
  const el = document.createElement("div");
  el.classList.add("list-item");

  if (options.leading) {
    const leading = document.createElement("div");
    leading.classList.add("flex", "items-center", "gap-2");
    if (typeof options.leading === "string") {
      leading.appendChild(Text(options.leading));
    } else {
      leading.appendChild(options.leading);
    }
    el.appendChild(leading);
  }

  el.appendChild(Text(options.title));

  if (options.subtitle) {
    const subtitle = document.createElement("span");
    subtitle.classList.add("meta");
    subtitle.appendChild(Text(options.subtitle));
    el.appendChild(subtitle);
  }

  if (options.trailing) {
    const trailing = document.createElement("div");
    trailing.classList.add("flex", "items-center", "gap-2");
    if (typeof options.trailing === "string") trailing.appendChild(Text(options.trailing));
    else trailing.appendChild(options.trailing);
    el.appendChild(trailing);
  }

  return { el };
}
