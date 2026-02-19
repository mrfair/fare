import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.ts";
export { template };

export function mount({ root }) {
  const out = $("#out", root);
  const show = (v) => out.text(typeof v === "string" ? v : JSON.stringify(v, null, 2));

  $("#ping", root).on("click", async () => {
    try { show(await (await fetch("/api/health")).json()); }
    catch (e) { show({ error: String(e) }); }
  });

  $("#load", root).on("click", async () => {
    try { show(await (await fetch("/api/items")).json()); }
    catch (e) { show({ error: String(e) }); }
  });

  $("#add", root).on("click", async () => {
    try {
      show(await (await fetch("/api/items", { credentials: "include",
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "New Item " + Math.floor(Math.random()*1000) })
      })).json());
    } catch (e) {
      show({ error: String(e) });
    }
  });

  return () => {
    $("#ping", root).destroy();
    $("#load", root).destroy();
    $("#add", root).destroy();
  };
}
