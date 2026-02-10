import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.js";

export { template };
export const outletSelector = "[data-outlet]";

const USERS = [
  { id: "u1", name: "Anan", role: "Admin" },
  { id: "u2", name: "Bee", role: "Editor" },
  { id: "u3", name: "Chai", role: "Viewer" },
  { id: "u4", name: "Dara", role: "Analyst" },
  { id: "u5", name: "Eak", role: "Support" },
];

export function mount({ root, navigate }) {
  const list = $("#list", root);
  const q = $("#q", root);
  const cnt = $("#cnt", root);

  const render = () => {
    const term = (q.value || "").trim().toLowerCase();
    const filtered = USERS.filter(u => u.name.toLowerCase().includes(term) || u.role.toLowerCase().includes(term));
    cnt.textContent = String(filtered.length);

    list.innerHTML = filtered.map(u => `
      <a class="user-item" data-link href="/users/${encodeURIComponent(u.id)}" aria-label="Open ${u.name}">
        <div>
          <div class="user-name">${u.name}</div>
          <div class="user-meta">${u.role}</div>
        </div>
        <span class="badge">ดู</span>
      </a>
    `).join("");
  };

  render();

  const offInput = $.on(q, "input", render);
  const offKey = $.on(q, "keydown", (e) => {
    if (e.key === "Enter") {
      const first = list.querySelector("a[data-link]");
      if (first) navigate(first.getAttribute("href"));
    }
  });

  return () => { offInput(); offKey(); };
}
