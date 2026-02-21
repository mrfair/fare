import { Icon } from "../Atoms/Icon";
import { Button } from "../Atoms/Button";
import { Text } from "../Atoms/Text";

export interface EmptyStateBlockOptions {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface EmptyStateBlockResult {
  root: HTMLDivElement;
  action?: HTMLButtonElement;
}

export function EmptyStateBlock(options: EmptyStateBlockOptions): EmptyStateBlockResult {
  const root = document.createElement("div");
  root.classList.add("list-item", "gap-3");

  if (options.icon) {
    const icon = Icon(options.icon);
    root.appendChild(icon);
  }

  root.appendChild(Text(options.title));

  if (options.message) {
    const msg = document.createElement("span");
    msg.classList.add("meta");
    msg.appendChild(Text(options.message));
    root.appendChild(msg);
  }

  if (options.actionLabel) {
    const action = Button({ text: options.actionLabel });
    action.addEventListener("click", () => options.onAction?.());
    root.appendChild(action);
    return { root, action };
  }

  return { root };
}
