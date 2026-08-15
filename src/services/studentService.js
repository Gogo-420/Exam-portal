/**
 * Student Portal API Service Layer
 * All endpoints are stubbed with mock data.
 * Replace each stub with the real `api.get/post/put` call once the backend is ready.
 */

import api from './api';
import {
  MOCK_STUDENT_PROFILE,
  MOCK_STUDENT_NOTIFICATIONS,
  MOCK_STUDENT_PERFORMANCE,
  MOCK_UPCOMING_INTERVIEWS,
  MOCK_COMPLETED_INTERVIEWS,
} from '../utils/mockData';

// ─── Dashboard ───────────────────────────────────────────────────────────────

/**
 * GET /student/dashboard
 * Returns summary stats for the logged-in student.
 */
export const getDashboardData = async () => {
  // TODO: const response = await api.get('/student/dashboard');
  // return response.data;
  const completed = MOCK_COMPLETED_INTERVIEWS;
  const upcoming  = MOCK_UPCOMING_INTERVIEWS;
  const avgScore  = completed.length
    ? Math.round(completed.reduce((s, e) => s + e.marks, 0) / completed.length)
    : 0;
  return {
    studentName:    MOCK_STUDENT_PROFILE.name,
    totalExams:     upcoming.length + completed.length,
    upcomingExams:  upcoming.length,
    completedExams: completed.length,
    currentRank:    1,
    warningCount:   MOCK_STUDENT_PERFORMANCE.stats.warningCount,
    avgScore,
    recentNotifications: MOCK_STUDENT_NOTIFICATIONS.slice(0, 3),
    upcomingList:    upcoming.slice(0, 3),
    recentResults:   completed.slice(0, 4),
  };
};

// ─── Upcoming Exams ──────────────────────────────────────────────────────────

/**
 * GET /student/upcoming-exams
 */
export const getUpcomingExams = async () => {
  // TODO: const response = await api.get('/student/upcoming-exams');
  // return response.data;
  return MOCK_UPCOMING_INTERVIEWS;
};

// ─── Completed Exams ─────────────────────────────────────────────────────────

/**
 * GET /student/completed-exams
 */
export const getCompletedExams = async () => {
  // TODO: const response = await api.get('/student/completed-exams');
  // return response.data;
  return MOCK_COMPLETED_INTERVIEWS;
};

// ─── Results ─────────────────────────────────────────────────────────────────

/**
 * GET /student/results/:resultId
 */
export const getResultById = async (resultId) => {
  // TODO: const response = await api.get(`/student/results/${resultId}`);
  // return response.data;
  return MOCK_COMPLETED_INTERVIEWS.find((r) => r.id === resultId) || null;
};

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * GET /student/profile
 */
export const getStudentProfile = async () => {
  // TODO: const response = await api.get('/student/profile');
  // return response.data;
  return MOCK_STUDENT_PROFILE;
};

/**
 * PUT /student/profile
 */
export const updateStudentProfile = async (payload) => {
  // TODO: const response = await api.put('/student/profile', payload);
  // return response.data;
  console.log('[API Mock] updateStudentProfile', payload);
  return { ...MOCK_STUDENT_PROFILE, ...payload };
};

/**
 * PUT /student/profile/password
 */
export const changePassword = async (payload) => {
  // TODO: const response = await api.put('/student/profile/password', payload);
  // return response.data;
  console.log('[API Mock] changePassword', { ...payload, newPassword: '***' });
  return { success: true };
};

// ─── Notifications ───────────────────────────────────────────────────────────

/**
 * GET /student/notifications
 */
export const getNotifications = async () => {
  // TODO: const response = await api.get('/student/notifications');
  // return response.data;
  return MOCK_STUDENT_NOTIFICATIONS;
};

/**
 * PUT /student/notifications/:id/read
 */
export const markNotificationRead = async (id) => {
  // TODO: await api.put(`/student/notifications/${id}/read`);
  console.log('[API Mock] markNotificationRead', id);
  return { success: true };
};

/**
 * PUT /student/notifications/read-all
 */
export const markAllNotificationsRead = async () => {
  // TODO: await api.put('/student/notifications/read-all');
  console.log('[API Mock] markAllNotificationsRead');
  return { success: true };
};

// ─── Performance Analytics ───────────────────────────────────────────────────

/**
 * GET /student/performance
 */
export const getPerformanceData = async () => {
  // TODO: const response = await api.get('/student/performance');
  // return response.data;
  return MOCK_STUDENT_PERFORMANCE;
};

// ─── Settings ────────────────────────────────────────────────────────────────

/**
 * GET /student/settings
 */
export const getStudentSettings = async () => {
  // TODO: const response = await api.get('/student/settings');
  // return response.data;
  const stored = localStorage.getItem('student_settings');
  if (stored) {
    try { return JSON.parse(stored); } catch (_) { /* fall through */ }
  }
  return {
    emailNotifications:  true,
    smsNotifications:    false,
    examReminders:       true,
    resultAlerts:        true,
    warningAlerts:       true,
    darkMode:            false,
    language:            'English',
    timezone:            'Asia/Kolkata (IST)',
    twoFactorAuth:       false,
    sessionTimeout:      30,
  };
};

/**
 * PUT /student/settings
 */
export const saveStudentSettings = async (payload) => {
  // TODO: const response = await api.put('/student/settings', payload);
  // return response.data;
  localStorage.setItem('student_settings', JSON.stringify(payload));
  console.log('[API Mock] saveStudentSettings', payload);
  return { success: true };
};
