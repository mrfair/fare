export interface TextareaOptions {
  placeholder?: string;
  rows?: number;
}

export function Textarea(options: TextareaOptions = {}): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  textarea.classList.add("input", "w-full", "text-sm");
  textarea.rows = options.rows ?? 3;
  if (options.placeholder) textarea.placeholder = options.placeholder;
  return textarea;
}
