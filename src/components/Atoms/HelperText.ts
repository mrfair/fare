export type HelperTextVariant = "hint" | "error";

export function HelperText(text: string, variant: HelperTextVariant = "hint"): HTMLParagraphElement {
  const p = document.createElement("p");
  p.classList.add("helper-text");
  p.dataset.state = variant;
  p.textContent = text;
  return p;
}
