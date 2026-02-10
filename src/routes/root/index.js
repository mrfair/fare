import template from "./index.html?raw";
import "./index.scss";
import { $ } from "../../app/dom.js";
import { getSession, logout } from "../../app/auth.js";

export { template };
export const outletSelector = "[data-outlet]";

export function mount({ root, outlet, path, navigate }) {
  const badge = $("#sessionBadge", root);
  const loginLink = $("#loginLink", root);
  const logoutBtn = $("#logoutBtn", root);

  const renderSession = () => {
    const s = getSession();
    if (!s) {
      badge.textContent = "guest";
      loginLink.style.display = "";
      logoutBtn.style.display = "none";
      return;
    }
    badge.textContent = `${s.username} (${(s.roles || []).join(",") || "user"})`;
    loginLink.style.display = "none";
    logoutBtn.style.display = "";
  };

  renderSession();

  const offKey = $.on(window, "keydown", (e) => {
    if (e.key === "Escape") document.activeElement?.blur?.();
  });

  const offLogout = $.on(logoutBtn, "click", () => {
    logout();
    renderSession();
    if (location.pathname.startsWith("/admin")) navigate("/");
  });

  if (path === "/") {
    outlet.innerHTML = `
      <section>
        <h1 style="margin: 0 0 8px 0; font-size: 20px;">หน้าแรก</h1>
        <p style="margin: 0; color: var(--muted); line-height: 1.7;">
          โครงนี้ออกแบบให้ <b>1 route = index.html + index.js + index.scss</b> และ build ออกเป็น chunk แยกต่อ route
          เพื่อให้ cache ได้ดีและโหลดเร็ว
        </p>

        <hr />

        <div class="row">
          <button class="btn primary" id="helloBtn">ทดสอบ $ wrapper</button>
          <span class="badge">ผลลัพธ์: <span id="helloOut">-</span></span>
        </div>

        <p style="margin: 10px 0 0 0; color: var(--muted); font-size: 13px;">
          ลองเข้า <b>Admin</b> ตอนยังไม่ login → จะถูก guard ส่งไปหน้า login (401)
        </p>
      </section>
    `;

    const btn = $("#helloBtn", root);
    const out = $("#helloOut", root);
    const offClick = $.on(btn, "click", () => { out.textContent = "สวัสดี 👋"; });

    return () => { offKey(); offLogout(); offClick(); };
  }

  return () => { offKey(); offLogout(); };
}
