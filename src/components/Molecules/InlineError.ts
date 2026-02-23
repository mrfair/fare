import { HelperText } from "../Atoms/HelperText";
import { WithClassAttribute } from "../shared";

export function InlineError(message: string, options: WithClassAttribute = {}): HTMLParagraphElement {
  return HelperText({ text: message, variant: "error", class: options.class });
}
