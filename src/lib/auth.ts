const SESSION_KEY = "shyn_admin_session";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, token);
  }
}

export function clearSessionToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}
