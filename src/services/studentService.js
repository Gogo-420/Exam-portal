/**
 * Student Portal service layer — production version.
 *
 * Every function calls the real backend via api.js.
 *
 * DEV FALLBACK: When VITE_API_BASE_URL is not set (no backend running) each
 * function catches the network error and returns the corresponding mock data
 * so the UI stays functional during frontend-only development.
 * Set VITE_API_BASE_URL in .env.local to point at a real backend and the
 * fallback is bypassed entirely.
 */

import { studentApiRoutes } from './api';
import {
  MOCK_STUDENT_PROFILE,
  MOCK_STUDENT_NOTIFICATIONS,
  MOCK_STUDENT_PERFORMANCE,
  MOCK_UPCOMING_INTERVIEWS,
  MOCK_COMPLETED_INTERVIEWS,
} from '../utils/mockData';

const IS_DEV_NO_BACKEND = !import.meta.env.VITE_API_BASE_URL;

/** Wraps a real API call with a mock fallback for dev-without-backend. */
async function withFallback(apiFn, fallback) {
  if (!IS_DEV_NO_BACKEND) return apiFn();
  try {
    return await apiFn();
  } catch {
    return fallback;
  }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardData = () =>
  withFallback(
    () => studentApiRoutes.dashboard(),
    (() => {
      const completed = MOCK_COMPLETED_INTERVIEWS;
      const upcoming  = MOCK_UPCOMING_INTERVIEWS;
      const avgScore  = completed.length
        ? Math.round(completed.reduce((s, e) => s + e.marks, 0) / completed.length)
        : 0;
      return {
        studentName:         MOCK_STUDENT_PROFILE.name,
        totalExams:          upcoming.length + completed.length,
        upcomingExams:       upcoming.length,
        completedExams:      completed.length,
        currentRank:         1,
        warningCount:        MOCK_STUDENT_PERFORMANCE.stats.warningCount,
        avgScore,
        recentNotifications: MOCK_STUDENT_NOTIFICATIONS.slice(0, 3),
        upcomingList:        upcoming.slice(0, 3),
        recentResults:       completed.slice(0, 4),
      };
    })(),
  );

// ─── Upcoming Exams ───────────────────────────────────────────────────────────

export const getUpcomingExams = () =>
  withFallback(() => studentApiRoutes.upcomingExams(), MOCK_UPCOMING_INTERVIEWS);

// ─── Completed Exams ──────────────────────────────────────────────────────────

export const getCompletedExams = () =>
  withFallback(() => studentApiRoutes.completedExams(), MOCK_COMPLETED_INTERVIEWS);

// ─── Result by ID ─────────────────────────────────────────────────────────────

export const getResultById = (resultId) =>
  withFallback(
    () => studentApiRoutes.resultById(resultId),
    MOCK_COMPLETED_INTERVIEWS.find((r) => r.id === resultId) ?? null,
  );

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getStudentProfile = () =>
  withFallback(() => studentApiRoutes.profile(), MOCK_STUDENT_PROFILE);

export const updateStudentProfile = (payload) =>
  withFallback(
    () => studentApiRoutes.updateProfile(payload),
    { ...MOCK_STUDENT_PROFILE, ...payload },
  );

export const changePassword = (payload) =>
  withFallback(() => studentApiRoutes.changePassword(payload), { success: true });

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = () =>
  withFallback(() => studentApiRoutes.notifications(), MOCK_STUDENT_NOTIFICATIONS);

export const markNotificationRead = (id) =>
  withFallback(() => studentApiRoutes.markRead(id), { success: true });

export const markAllNotificationsRead = () =>
  withFallback(() => studentApiRoutes.markAllRead(), { success: true });

// ─── Performance ──────────────────────────────────────────────────────────────

export const getPerformanceData = () =>
  withFallback(() => studentApiRoutes.performance(), MOCK_STUDENT_PERFORMANCE);

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  smsNotifications:   false,
  examReminders:      true,
  resultAlerts:       true,
  warningAlerts:      true,
  darkMode:           false,
  language:           'English',
  timezone:           'Asia/Kolkata (IST)',
  twoFactorAuth:      false,
  sessionTimeout:     30,
};

export const getStudentSettings = () =>
  withFallback(() => studentApiRoutes.settings(), DEFAULT_SETTINGS);

export const saveStudentSettings = (payload) =>
  withFallback(() => studentApiRoutes.saveSettings(payload), { success: true });

// ─── Exam questions ───────────────────────────────────────────────────────────

export const getExamQuestions = (interviewId) =>
  withFallback(() => studentApiRoutes.examQuestions(interviewId), []);

// ─── Submit exam ──────────────────────────────────────────────────────────────

export const submitExamAnswers = (interviewId, payload) =>
  withFallback(() => studentApiRoutes.submitExam(interviewId, payload), {
    success: true, score: 0, rank: null, totalQuestions: payload?.answers?.length ?? 0,
  });
