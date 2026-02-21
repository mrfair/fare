export function Icon(content: string): HTMLSpanElement {
  const icon = document.createElement("span");
  icon.classList.add("icon");
  icon.innerHTML = content;
  return icon;
}
