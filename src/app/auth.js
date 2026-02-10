/**
 * Auth model (sync for router/guards) + backend Google OAuth integration.
 *
 * - Router/guards MUST be synchronous => we store a lightweight session mirror in localStorage.
 * - Real auth cookie lives as HttpOnly cookie on backend (Workers).
 * - On app start, call `bootstrapSession()` to sync localStorage from `/api/auth/me`.
 */
const LS_KEY = "spa_demo_session_v1";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}

export function isAuthed() {
  return !!getSession();
}

export function getRoles() {
  return getSession()?.roles || [];
}

export function setSession(session) {
  if (!session) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(session));
}

export async function bootstrapSession() {
  // Pull user identity from backend cookie -> mirror to localStorage for sync guards.
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const s = data?.session;
    if (s) {
      setSession({
        username: s.email || s.name || "user",
        roles: [], // map roles here if you want (e.g. workspace role)
        token: "cookie",
        loginAt: Date.now(),
        picture: s.picture || null,
        email: s.email || null,
        sub: s.sub || null,
      });
    } else {
      setSession(null);
    }
  } catch {
    // ignore
  }
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {}
  setSession(null);
}
