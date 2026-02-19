import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.ts";
import { bt } from "../../components/bt.js";

export { template };

export function mount({ root }) {
  let n = 0;
  const count = $("#count", root);

  const b = bt({
    text: "My Button",
    onClick() {
      n += 1;
      count.text(String(n));
      console.log("bt clicked", n);
    },
  });

  $("#slot", root).get().appendChild(b.el);

  return () => b.destroy?.();
}
