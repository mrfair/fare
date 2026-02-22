import { Heading } from "../Atoms/Text";

export interface FormSectionOptions {
  title?: string;
  description?: string;
  children?: HTMLElement[];
}

export function FormSection(options: FormSectionOptions): HTMLDivElement {
  const root = document.createElement("section");
  root.classList.add("flex", "flex-col", "gap-3", "w-full");

  if (options.title) {
    const heading = Heading(3, options.title);
    heading.classList.add("m-0");
    root.appendChild(heading);
  }

  if (options.description) {
    const desc = document.createElement("p");
    desc.classList.add("text-sm");
    desc.style.setProperty("color", "var(--muted)");
    desc.style.setProperty("margin", "0");
    desc.textContent = options.description;
    root.appendChild(desc);
  }

  const content = document.createElement("div");
  content.classList.add("flex", "flex-col", "gap-3", "w-full");
  (options.children || []).forEach((child) => content.appendChild(child));
  root.appendChild(content);

  return root;
}
