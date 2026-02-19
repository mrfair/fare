import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../../app/dom.ts";

export { template };

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      }, { once: true });
    }
  });
}

export function mount({ root, params, navigate }) {
  const uid = $("#uid", root);
  const box = $("#box", root);
  const refresh = $("#refresh", root);
  const back = $("#back", root);

  uid.textContent = params.id;

  const ac = new AbortController();

  async function load() {
    box.innerHTML = `<div style="color: var(--muted);">กำลังโหลดข้อมูล (จำลอง)...</div>`;
    try {
      const profile = {
        id: params.id,
        updatedAt: new Date().toLocaleString("th-TH"),
        note: "nested route ถูก render ใน outlet ของ /users",
      };
      box.innerHTML = `
        <div style="font-weight: 650; margin-bottom: 6px;">User: ${profile.id}</div>
        <div style="color: var(--muted); line-height: 1.6;">${profile.note}</div>
        <div style="margin-top: 10px;" class="badge">updated: ${profile.updatedAt}</div>
      `;
    } catch (e) {
      if (e?.name === "AbortError") return;
      box.innerHTML = `<div style="color: var(--danger);">โหลดไม่สำเร็จ</div>`;
    }
  }

  load();

  const offRefresh = $.on(refresh, "click", load);
  const offBack = $.on(back, "click", () => navigate("/users"));

  return () => { offRefresh(); offBack(); ac.abort(); };
}
