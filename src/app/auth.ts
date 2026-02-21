/**
 * Auth model (sync for router guards) + backend Google OAuth mirror.
 *
 * We only persist a lightweight session mirror in localStorage so guards stay
 * synchronous while the real identity lives inside an HttpOnly cookie.
 */
const LS_KEY = "spa_demo_session_v1";

type BackendSession = {
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
};

export interface SessionMirror {
  username: string;
  roles: string[];
  token: string;
  loginAt: number;
  picture: string | null;
  email: string | null;
  sub: string | null;
}

type AuthResponse = {
  session?: BackendSession | null;
};

export function getSession(): SessionMirror | null {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}

export function isAuthed(): boolean {
  return !!getSession();
}

export function getRoles(): string[] {
  return getSession()?.roles || [];
}

export function setSession(session: SessionMirror | null): void {
  if (!session) {
    localStorage.removeItem(LS_KEY);
  } else {
    localStorage.setItem(LS_KEY, JSON.stringify(session));
  }
}

export async function bootstrapSession(): Promise<void> {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) return;
    const data: AuthResponse = await res.json();
    const s = data?.session;
    if (s) {
      setSession({
        username: s.email || s.name || "user",
        roles: [],
        token: "cookie",
        loginAt: Date.now(),
        picture: s.picture ?? null,
        email: s.email ?? null,
        sub: s.sub ?? null,
      });
    } else {
      setSession(null);
    }
  } catch {
    // ignore
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    // ignore
  }
  setSession(null);
}
