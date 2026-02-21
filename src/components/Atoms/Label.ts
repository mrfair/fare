export function Label(text: string, htmlFor?: string): HTMLLabelElement {
  const label = document.createElement("label");
  label.classList.add("text-sm", "font-medium");
  label.textContent = text;
  if (htmlFor) label.htmlFor = htmlFor;
  return label;
}
