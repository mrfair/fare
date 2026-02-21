export interface AlertOptions {
  message: string;
  tone?: "info" | "success" | "warn" | "error";
}

export function Alert(options: AlertOptions): HTMLDivElement {
  const el = document.createElement("div");
  el.classList.add("alert");
  el.classList.add(options.tone || "info");
  el.textContent = options.message;
  return el;
}
