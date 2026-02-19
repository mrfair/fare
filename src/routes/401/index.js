import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.ts";
export { template };
export function mount({ root, query }) {
  $("#from", root).textContent = typeof query.from === "string" ? query.from : "-";
  const off = $.on($("#backBtn", root), "click", () => history.back());
  return () => off();
}
