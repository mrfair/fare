import { ListItem } from "../Molecules/ListItem";
import { Button } from "../Atoms/Button";

export interface NotificationItem {
  title: string;
  message: string;
  seen?: boolean;
}

export interface NotificationCenterResult {
  root: HTMLDivElement;
  add(notification: NotificationItem): void;
}

export function NotificationCenter(notifications: NotificationItem[] = []): NotificationCenterResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-2", "p-3", "rounded-2xl", "border");
  root.style.setProperty("border-color", "var(--border)");
  root.style.setProperty("background", "rgba(255,255,255,.03)");

  const header = document.createElement("div");
  header.classList.add("flex", "justify-between", "items-center");
  const title = document.createElement("strong");
  title.textContent = "Notifications";
  const clear = Button({ text: "Clear all", variant: "ghost" });
  clear.addEventListener("click", () => {
    container.innerHTML = "";
  });
  header.appendChild(title);
  header.appendChild(clear);

  const container = document.createElement("div");
  container.classList.add("flex", "flex-col", "gap-2");

  const append = (notification: NotificationItem) => {
    const item = ListItem({ title: notification.title, subtitle: notification.message });
    container.appendChild(item.el);
  };

  notifications.forEach(append);

  root.appendChild(header);
  root.appendChild(container);

  return {
    root,
    add(notification: NotificationItem) {
      append(notification);
    },
  };
}
