import { applyClassAttribute, WithClassAttribute } from "../shared";

export function Spinner(options: WithClassAttribute = {}): HTMLSpanElement {
  const spinner = document.createElement("span");
  spinner.classList.add("spinner");
  applyClassAttribute(spinner, options.class);
  return spinner;
}
