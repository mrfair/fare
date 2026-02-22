import { Button } from "../Atoms/Button";
import { Heading } from "../Atoms/Text";

export interface DrawerOptions {
  title?: string;
  content: HTMLElement | string;
  position?: "left" | "right" | "bottom";
  onClose?: () => void;
}

export interface DrawerResult {
  root: HTMLDivElement;
  open(): void;
  close(): void;
}

export function Drawer(options: DrawerOptions): DrawerResult {
  const overlay = document.createElement("div");
  overlay.classList.add("fixed", "inset-0", "bg-[rgba(0,0,0,.4)]", "flex");
  overlay.style.setProperty("z-index", "25");
  overlay.style.setProperty("display", "none");

  const drawer = document.createElement("div");
  drawer.classList.add("bg-[var(--card)]", "rounded-2xl", "p-5", "flex", "flex-col", "gap-3");
  drawer.style.setProperty("border", "1px solid var(--border)");

  if (options.position === "bottom") {
    overlay.classList.add("items-end", "justify-center");
    drawer.classList.add("w-full", "max-w-full");
    drawer.style.setProperty("border-radius", "var(--r-2xl) var(--r-2xl) 0 0");
  } else {
    drawer.classList.add("h-full", "max-w-xs");
    overlay.classList.add("items-stretch");
    if (options.position === "left") {
      overlay.classList.add("justify-start");
    } else {
      overlay.classList.add("justify-end");
    }
  }

  if (options.title) {
    const heading = Heading(4, options.title);
    heading.classList.add("m-0");
    drawer.appendChild(heading);
  }

  if (typeof options.content === "string") {
    const body = document.createElement("p");
    body.textContent = options.content;
    body.classList.add("text-sm");
    body.style.setProperty("margin", "0");
    drawer.appendChild(body);
  } else {
    drawer.appendChild(options.content);
  }

  const closeBtn = Button({ text: "Close", variant: "ghost" });
  closeBtn.addEventListener("click", () => close());
  drawer.appendChild(closeBtn);

  overlay.appendChild(drawer);
  document.body.appendChild(overlay);

  const open = () => {
    overlay.style.display = "flex";
  };
  const close = () => {
    overlay.style.display = "none";
    options.onClose?.();
  };

  return { root: overlay, open, close };
}
