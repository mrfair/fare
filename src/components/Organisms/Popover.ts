export interface PopoverOptions {
  trigger: HTMLElement;
  content: HTMLElement | string;
  position?: "top" | "bottom" | "left" | "right";
}

export interface PopoverResult {
  root: HTMLDivElement;
  open(): void;
  close(): void;
}

export function Popover(options: PopoverOptions): PopoverResult {
  const popover = document.createElement("div");
  popover.classList.add("absolute", "rounded-lg", "p-3", "shadow-sm", "bg-[var(--card)]");
  popover.style.setProperty("border", "1px solid var(--border)");
  popover.style.setProperty("display", "none");
  popover.style.setProperty("z-index", "15");

  if (typeof options.content === "string") {
    popover.textContent = options.content;
  } else {
    popover.appendChild(options.content);
  }

  document.body.appendChild(popover);

  const place = () => {
    const rect = options.trigger.getBoundingClientRect();
    const margin = 8;
    if (options.position === "bottom" || !options.position) {
      popover.style.left = `${rect.left}px`;
      popover.style.top = `${rect.bottom + margin}px`;
    }
    if (options.position === "top") {
      popover.style.left = `${rect.left}px`;
      popover.style.top = `${rect.top - popover.offsetHeight - margin}px`;
    }
    if (options.position === "right") {
      popover.style.left = `${rect.right + margin}px`;
      popover.style.top = `${rect.top}px`;
    }
    if (options.position === "left") {
      popover.style.left = `${rect.left - popover.offsetWidth - margin}px`;
      popover.style.top = `${rect.top}px`;
    }
  };

  const open = () => {
    place();
    popover.style.display = "block";
  };

  const close = () => {
    popover.style.display = "none";
  };

  options.trigger.addEventListener("mouseenter", open);
  options.trigger.addEventListener("mouseleave", close);

  return { root: popover, open, close };
}
