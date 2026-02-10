import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.js";

export { template };

export function mount({ root, query }) {
  const msg = $("#msg", root);
  const next = typeof query.next === "string" ? query.next : "/";
  msg.text(`หลัง login จะกลับไป: ${next}`);

  $("#googleBtn", root).on("click", () => {
    // redirect to backend start endpoint (Vite proxy maps /api -> backend in dev)
    const url = `/api/auth/google/start?next=${encodeURIComponent(next)}`;
    window.location.href = url;
  });

  return () => $("#googleBtn", root).destroy();
}
