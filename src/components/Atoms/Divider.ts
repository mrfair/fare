import { applyClassAttribute, WithClassAttribute } from "../shared";

export function Divider(options: WithClassAttribute = {}): HTMLHRElement {
  const hr = document.createElement("hr");
  hr.classList.add("divider");
  applyClassAttribute(hr, options.class);
  return hr;
}
