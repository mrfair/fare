import { ToastItem, ToastItemOptions } from "../Molecules/ToastItem";

export interface ToastSystemResult {
  notify(options: ToastItemOptions): void;
}

export function ToastSystem(): ToastSystemResult {
  const container = document.createElement("div");
  container.classList.add("fixed", "top-4", "right-4", "flex", "flex-col", "gap-3");
  container.style.setProperty("z-index", "30");
  document.body.appendChild(container);

  return {
    notify(options) {
      const toast = ToastItem({
        message: options.message,
        tone: options.tone,
        onClose: () => {
          toast.remove();
        },
      });
      container.appendChild(toast);
    },
  };
}
