export function Link(href: string, text: string, options: { target?: string } = {}): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.classList.add("link", "font-medium");
  anchor.href = href;
  anchor.textContent = text;
  if (options.target) anchor.target = options.target;
  return anchor;
}
