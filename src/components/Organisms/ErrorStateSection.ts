import { Alert } from "../Molecules/Alert";
import { WithClassAttribute } from "../shared";

export interface ErrorStateSectionOptions extends WithClassAttribute {
  title: string;
  message?: string;
}

export function ErrorStateSection(options: ErrorStateSectionOptions): HTMLDivElement {
  const alert = Alert({
    message: `${options.title}: ${options.message ?? ""}`,
    tone: "error",
    class: options.class,
  });
  return alert;
}
