import { Button } from "../Atoms/Button";
import { Heading } from "../Atoms/Text";

export interface ModalOptions {
  title?: string;
  content: HTMLElement | string;
  onClose?: () => void;
}

export interface ModalResult {
  root: HTMLDivElement;
  open(): void;
  close(): void;
}

export function Modal(options: ModalOptions): ModalResult {
  const overlay = document.createElement("div");
  overlay.classList.add("fixed", "inset-0", "bg-[rgba(0,0,0,.6)]", "flex", "items-center", "justify-center", "p-4");
  overlay.style.setProperty("z-index", "30");

  const dialog = document.createElement("div");
  dialog.classList.add("bg-[var(--card)]", "rounded-2xl", "p-5", "flex", "flex-col", "gap-3", "max-w-lg", "w-full");
  dialog.style.setProperty("border", "1px solid var(--border)");

  if (options.title) {
    const heading = Heading(3, options.title);
    heading.classList.add("m-0");
    dialog.appendChild(heading);
  }

  const body = document.createElement("div");
  if (typeof options.content === "string") {
    body.textContent = options.content;
  } else {
    body.appendChild(options.content);
  }
  dialog.appendChild(body);

  const actions = document.createElement("div");
  actions.classList.add("flex", "justify-end", "gap-2");
  const close = Button({ text: "Close", variant: "ghost" });
  close.addEventListener("click", () => {
    closeModal();
  });
  actions.appendChild(close);
  dialog.appendChild(actions);

  overlay.appendChild(dialog);

  const closeModal = () => {
    overlay.style.display = "none";
    options.onClose?.();
  };

  const openModal = () => {
    overlay.style.display = "flex";
  };

  document.body.appendChild(overlay);
  closeModal();

  return { root: overlay, open: openModal, close: closeModal };
}
