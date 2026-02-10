import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.js";

export { template };

export function mount({ root, query }) {
  const mode = query?.mode === "demo" ? "โหมด demo" : "ปกติ";
  $("#tickOut", root).text(`ตอนนี้อยู่ใน ${mode}`);

  let timer = null;
  let count = 0;

  const btn = $("#tickBtn", root);
  const out = $("#tickOut", root);

  const start = () => {
    if (timer) return;
    timer = setInterval(() => {
      count += 1;
      out.textContent = String(count);
    }, 500);
    btn.textContent = "กำลังนับ...";
    btn.disabled = true;
  };

  const offClick = $.on(btn, "click", start);

  return () => {
    offClick();
    if (timer) clearInterval(timer);
    timer = null;
  };
}
