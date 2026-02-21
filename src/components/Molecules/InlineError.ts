import { HelperText } from "../Atoms/HelperText";

export function InlineError(message: string): HTMLParagraphElement {
  return HelperText(message, "error");
}
