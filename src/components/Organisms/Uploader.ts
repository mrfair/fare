import { Button } from "../Atoms/Button";

export interface UploaderOptions {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onSelect?: (files: FileList) => void;
}

export interface UploaderResult {
  root: HTMLDivElement;
}

export function Uploader(options: UploaderOptions): UploaderResult {
  const root = document.createElement("div");
  root.classList.add("flex", "flex-col", "gap-2");

  const input = document.createElement("input");
  input.type = "file";
  input.accept = options.accept ?? "";
  input.multiple = !!options.multiple;
  input.classList.add("hidden");

  const button = Button({ text: options.label ?? "Upload" });
  button.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    if (input.files) {
      options.onSelect?.(input.files);
    }
  });

  root.appendChild(button);
  root.appendChild(input);
  return { root };
}
