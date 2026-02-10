import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../../app/dom.js";

export { template };

export function mount({ root }) {
  const flag = $("#flag", root);
  const out = $("#out", root);
  const off = $.on(flag, "change", () => { out.textContent = flag.checked ? "on" : "off"; });
  return () => off();
}
