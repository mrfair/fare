import { applyClassAttribute, WithClassAttribute } from "../shared";

export interface TextareaOptions extends WithClassAttribute {
  placeholder?: string;
  rows?: number;
}

export function Textarea(options: TextareaOptions = {}): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.classList.add("input", "w-full", "text-sm");
  textarea.rows = options.rows ?? 3;
  if (options.placeholder) textarea.placeholder = options.placeholder;
  applyClassAttribute(textarea, options.class);
  return textarea;
}
