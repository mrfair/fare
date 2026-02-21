import { Button } from "../Atoms/Button";
import { Link } from "../Atoms/Link";
import { Avatar } from "../Atoms/Avatar";
import { Heading } from "../Atoms/Text";

export interface AppHeaderOptions {
  title: string;
  links?: { label: string; href: string }[];
  onLogin?: () => void;
}

export function AppHeader(options: AppHeaderOptions): HTMLDivElement {
  const header = document.createElement("header");
  header.classList.add("flex", "items-center", "justify-between", "gap-4", "p-4");

  header.style.maxWidth = "100%";

  const logo = Avatar({ label: options.title.slice(0, 2).toUpperCase() });
  header.appendChild(logo);

  const title = Heading(1, options.title);
  title.classList.add("m-0", "text-base");
  header.appendChild(title);

  const nav = document.createElement("nav");
  nav.classList.add("flex", "gap-3", "items-center", "flex-wrap");
  (options.links || []).forEach((link) => {
    nav.appendChild(Link(link.href, link.label));
  });
  header.appendChild(nav);

  const actions = document.createElement("div");
  actions.classList.add("flex", "gap-3", "items-center", "flex-wrap");
  const login = Button({ text: "Login", variant: "primary" });
  login.addEventListener("click", () => options.onLogin?.());
  actions.appendChild(login);
  header.appendChild(actions);

  return header;
}
