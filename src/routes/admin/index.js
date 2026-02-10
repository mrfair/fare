import template from "./index.html?raw";
import "./index.scss";

export { template };
export const outletSelector = "[data-outlet]";

export const requiresAuth = true;
export const roles = ["admin"];

export function mount({ outlet, session, path }) {
  if (path === "/admin") {
    outlet.innerHTML = `
      <div class="row" style="justify-content: space-between;">
        <div>
          <div style="font-weight: 700; margin-bottom: 6px;">Admin Dashboard</div>
          <div style="color: var(--muted); line-height:1.6;">
            สวัสดี, <b>${session?.username || "?"}</b> — คุณมีสิทธิ์ admin แล้ว
          </div>
        </div>
        <span class="badge">protected</span>
      </div>
      <hr />
      <div style="color: var(--muted); line-height:1.7;">
        คลิก <b>Settings</b> เพื่อดู nested route ภายใต้ /admin
      </div>
    `;
  }
  return null;
}
