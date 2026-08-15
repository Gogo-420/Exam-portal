/**
 * Session storage helpers — production version.
 *
 * Only the authenticated session (token + user profile) is persisted here.
 * All application data (exams, results, notifications, …) is fetched from
 * the backend on demand and stored in React state / DataContext — never in
 * localStorage.
 */

const KEYS = {
  USER:  'exam_portal_user',
  TOKEN: 'exam_portal_token',
};

export const storage = {
  // ── Token ────────────────────────────────────────────────────────────────
  getToken:    ()      => localStorage.getItem(KEYS.TOKEN) ?? null,
  setToken:    (tok)   => localStorage.setItem(KEYS.TOKEN, tok),
  removeToken: ()      => localStorage.removeItem(KEYS.TOKEN),

  // ── User profile (cached from /auth/me — never the source of truth) ──────
  getUser:    () => {
    try {
      const raw = localStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser:    (user)   => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  removeUser: ()       => localStorage.removeItem(KEYS.USER),

  // ── Clear entire session (call on logout) ────────────────────────────────
  clearSession: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.TOKEN);
  },
};

/**
 * No-op kept for import compatibility with any file that still calls
 * initializeStorage(). Safe to remove once all call-sites are cleaned up.
 */
export const initializeStorage = () => {};
