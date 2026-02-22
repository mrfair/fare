import { Button } from "../Atoms/Button";

export interface PermissionRequestBlockOptions {
  title: string;
  description?: string;
  onGrant?: () => void;
  onDeny?: () => void;
}

export function PermissionRequestBlock(options: PermissionRequestBlockOptions): HTMLDivElement {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-3", "p-4", "border", "rounded-2xl");
  root.style.setProperty("border-color", "var(--border)");

  const title = document.createElement("strong");
  title.textContent = options.title;
  root.appendChild(title);

  if (options.description) {
    const desc = document.createElement("p");
    desc.textContent = options.description;
    desc.classList.add("text-sm");
    desc.style.setProperty("margin", "0");
    root.appendChild(desc);
  }

  const row = document.createElement("div");
  row.classList.add("flex", "gap-2");
  const grant = Button({ text: "Allow", variant: "primary" });
  const deny = Button({ text: "Deny", variant: "ghost" });
  grant.addEventListener("click", () => options.onGrant?.());
  deny.addEventListener("click", () => options.onDeny?.());
  row.appendChild(grant);
  row.appendChild(deny);
  root.appendChild(row);

  return root;
}
