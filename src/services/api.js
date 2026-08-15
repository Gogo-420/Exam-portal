/**
 * Axios API client — production-ready.
 *
 * Base URL resolution order:
 *   1. VITE_API_BASE_URL env var (set in production / .env.local)
 *   2. /api/v1  (proxied to localhost:8000 by vite.config.ts in dev)
 *
 * Auth: Bearer JWT stored in localStorage under 'exam_portal_token'.
 * On 401: token is cleared and the browser is redirected to /student/login
 *          (or the appropriate role login page if we can decode the stored role).
 */

import axios from 'axios';

// ─── Client instance ─────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Token helpers ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'exam_portal_token';
const USER_KEY  = 'exam_portal_user';

export const tokenStorage = {
  get:    ()      => localStorage.getItem(TOKEN_KEY),
  set:    (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: ()      => localStorage.removeItem(TOKEN_KEY),
};

/**
 * Decode a JWT payload without verifying the signature (client-side only).
 * Verification happens server-side; here we just read the expiry claim.
 */
export function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/**
 * Returns true when the token exists AND has not expired (with a 30 s buffer).
 */
export function isTokenValid(token) {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now() + 30_000;
}

// ─── Request interceptor — attach token ──────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — normalise errors & handle 401 ───────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token expired or invalid — clear session and redirect to login
      tokenStorage.remove();
      localStorage.removeItem(USER_KEY);

      // Determine role from stored user so we redirect to the right login page
      let loginPath = '/student/login';
      try {
        const stored = localStorage.getItem(USER_KEY);
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.role) loginPath = `/${u.role}/login`;
        }
      } catch { /* ignore */ }

      // Only navigate if not already on a login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = loginPath;
      }
    }

    // Normalise error message so callers get a consistent shape:
    //   error.message — human-readable string from the server or a generic fallback
    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.';

    const normalisedError = new Error(serverMessage);
    normalisedError.status = status;
    normalisedError.data   = error.response?.data ?? null;
    return Promise.reject(normalisedError);
  },
);

// ─── Auth service ─────────────────────────────────────────────────────────────

/**
 * POST /auth/:role/login
 * Returns: { token: string, user: UserObject }
 */
export const authService = {
  login: (credentials, role) =>
    api.post(`/auth/${role}/login`, credentials).then((r) => r.data),

  /**
   * POST /auth/:role/register
   * Returns: { token: string, user: UserObject }
   */
  register: (userData, role) =>
    api.post(`/auth/${role}/register`, userData).then((r) => r.data),

  /**
   * GET /auth/me — validates the current token server-side and returns the user
   * Returns: UserObject
   */
  getCurrentUser: () =>
    api.get('/auth/me').then((r) => r.data),

  /**
   * POST /auth/logout — invalidates the server-side session / refresh token
   */
  logout: () =>
    api.post('/auth/logout').catch(() => { /* best-effort */ }),
};

// ─── Student service stubs (used by studentService.js) ───────────────────────

export const studentApiRoutes = {
  dashboard:          () => api.get('/student/dashboard').then((r) => r.data),
  upcomingExams:      () => api.get('/student/upcoming-exams').then((r) => r.data),
  completedExams:     () => api.get('/student/completed-exams').then((r) => r.data),
  resultById:    (id) => api.get(`/student/results/${id}`).then((r) => r.data),
  profile:            () => api.get('/student/profile').then((r) => r.data),
  updateProfile: (p)  => api.put('/student/profile', p).then((r) => r.data),
  changePassword:(p)  => api.put('/student/profile/password', p).then((r) => r.data),
  notifications:      () => api.get('/student/notifications').then((r) => r.data),
  markRead:      (id) => api.put(`/student/notifications/${id}/read`).then((r) => r.data),
  markAllRead:        () => api.put('/student/notifications/read-all').then((r) => r.data),
  performance:        () => api.get('/student/performance').then((r) => r.data),
  settings:           () => api.get('/student/settings').then((r) => r.data),
  saveSettings:  (p)  => api.put('/student/settings', p).then((r) => r.data),
  examQuestions: (id) => api.get(`/student/exam/${id}/questions`).then((r) => r.data),
  submitExam:  (id,p) => api.post(`/student/exam/${id}/submit`, p).then((r) => r.data),
};

// ─── Interviewer service stubs ────────────────────────────────────────────────

export const interviewerApiRoutes = {
  uploadPDF:   (fd)  => api.post('/interviewer/upload-pdf', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data),
  candidates:  ()    => api.get('/interviewer/candidates').then((r) => r.data),
  leaderboard: ()    => api.get('/interviewer/leaderboard').then((r) => r.data),
};

// ─── Admin service stubs ──────────────────────────────────────────────────────

export const adminApiRoutes = {
  dashboardStats: () => api.get('/admin/analytics').then((r) => r.data),
  students:       () => api.get('/admin/students').then((r) => r.data),
  interviewers:   () => api.get('/admin/interviewers').then((r) => r.data),
};

// ─── Proctoring service ───────────────────────────────────────────────────────

export const proctoringService = {
  logViolation: (interviewId, violationData) =>
    api.post(`/proctoring/${interviewId}/log`, violationData).then((r) => r.data),
};

export default api;
