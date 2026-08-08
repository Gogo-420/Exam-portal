import axios from 'axios';

/**
 * Configure Axios Instance for Exam Portal
 * Standardized base API client with authorization headers and response interceptors.
 * Ready for seamless backend REST API integration.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('exam_portal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global API Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // TODO: Handle token expiration or unauthorized access in real backend mode
      console.warn('Unauthorized access detected. Redirecting to login.');
    }
    return Promise.reject(error);
  }
);

/* ==========================================================================
   PLACEHOLDER API SERVICES WITH TODO COMMENTS FOR FUTURE BACKEND INTEGRATION
   ========================================================================== */

/**
 * Auth Service
 * TODO: Replace with real backend authentication endpoints (/auth/login, /auth/register)
 */
export const authService = {
  login: async (credentials, role) => {
    // TODO: const response = await api.post(`/auth/${role}/login`, credentials);
    // return response.data;
    console.log(`[API Mock] Login request for role: ${role}`, credentials);
    return { success: true, message: 'Mock login successful' };
  },

  register: async (userData, role) => {
    // TODO: const response = await api.post(`/auth/${role}/register`, userData);
    // return response.data;
    console.log(`[API Mock] Register request for role: ${role}`, userData);
    return { success: true, message: 'Mock registration successful' };
  },

  getCurrentUser: async () => {
    // TODO: const response = await api.get('/auth/me');
    // return response.data;
    const stored = localStorage.getItem('exam_portal_user');
    return stored ? JSON.parse(stored) : null;
  },
};

/**
 * Student Service
 * TODO: Replace with real backend endpoints for student interviews & test submission
 */
export const studentService = {
  getUpcomingInterviews: async () => {
    // TODO: const response = await api.get('/student/interviews/upcoming');
    // return response.data;
    return [];
  },

  getCompletedInterviews: async () => {
    // TODO: const response = await api.get('/student/interviews/completed');
    // return response.data;
    return [];
  },

  getExamQuestions: async (interviewId) => {
    // TODO: const response = await api.get(`/student/exam/${interviewId}/questions`);
    // return response.data;
    console.log(`[API Mock] Fetching questions for exam ID: ${interviewId}`);
    return [];
  },

  submitExamAnswers: async (interviewId, answersPayload) => {
    // TODO: const response = await api.post(`/student/exam/${interviewId}/submit`, answersPayload);
    // return response.data;
    console.log(`[API Mock] Submitting exam answers for ID: ${interviewId}`, answersPayload);
    return { success: true, score: 85, rank: 3, totalQuestions: answersPayload.length };
  },
};

/**
 * Interviewer Service
 * TODO: Replace with backend service for PDF question generation and candidates management
 */
export const interviewerService = {
  uploadQuestionPDF: async (formData) => {
    // TODO: const response = await api.post('/interviewer/upload-pdf', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return response.data;
    console.log('[API Mock] PDF Upload request received.');
    return {
      success: true,
      message: 'PDF uploaded successfully. Questions will be converted into MCQs by the backend AI service.',
      fileId: 'pdf_' + Date.now(),
    };
  },

  getCandidates: async () => {
    // TODO: const response = await api.get('/interviewer/candidates');
    // return response.data;
    return [];
  },

  getLeaderboard: async () => {
    // TODO: const response = await api.get('/interviewer/leaderboard');
    // return response.data;
    return [];
  },
};

/**
 * Admin Service
 * TODO: Replace with real backend endpoint for university management & system analytics
 */
export const adminService = {
  getDashboardStats: async () => {
    // TODO: const response = await api.get('/admin/analytics');
    // return response.data;
    return {};
  },

  getStudents: async () => {
    // TODO: const response = await api.get('/admin/students');
    // return response.data;
    return [];
  },

  getInterviewers: async () => {
    // TODO: const response = await api.get('/admin/interviewers');
    // return response.data;
    return [];
  },
};

/**
 * Proctoring Log Service
 * TODO: Replace with real-time WebSocket or REST logging endpoint
 */
export const proctoringService = {
  logViolation: async (interviewId, violationData) => {
    // TODO: await api.post(`/proctoring/${interviewId}/log`, violationData);
    console.warn(`[Proctoring Alert] Exam: ${interviewId}`, violationData);
    return { logged: true };
  },
};

export default api;
