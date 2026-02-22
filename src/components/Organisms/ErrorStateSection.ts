import { Alert } from "../Molecules/Alert";

export interface ErrorStateSectionOptions {
  title: string;
  message?: string;
}

export function ErrorStateSection(options: ErrorStateSectionOptions): HTMLDivElement {
  const alert = Alert({ message: `${options.title}: ${options.message ?? ""}`, tone: "error" });
  return alert;
}
