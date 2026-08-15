/**
 * DataContext — production version.
 *
 * All data is fetched from the backend through the service layer.
 * localStorage is NOT used as a data store — it only holds the auth session.
 *
 * Optimistic updates are used for exam submission so the result page renders
 * instantly without waiting for a second fetch.
 *
 * DEV NOTE: When VITE_API_BASE_URL is unset (no backend running) the service
 * functions fall back to mock data automatically — see studentService.js.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { studentApiRoutes, interviewerApiRoutes, adminApiRoutes } from '../services/api';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // ── Shared state ──────────────────────────────────────────────────────────
  // Each slice starts empty; pages fetch on mount via the service layer.
  const [interviews,          setInterviews]          = useState([]);
  const [completedInterviews, setCompletedInterviews] = useState([]);
  const [students,            setStudents]            = useState([]);
  const [interviewers,        setInterviewers]        = useState([]);
  const [feedbacks,           setFeedbacks]           = useState([]);
  const [settings,            setSettings]            = useState({
    strictness:     'High',
    maxWarnings:    3,
    examDuration:   45,
    fullscreenLock: true,
  });

  // ── Data loaders (called by pages on mount) ───────────────────────────────

  const loadInterviews = useCallback(async () => {
    const data = await studentApiRoutes.upcomingExams();
    setInterviews(data);
    return data;
  }, []);

  const loadCompletedInterviews = useCallback(async () => {
    const data = await studentApiRoutes.completedExams();
    setCompletedInterviews(data);
    return data;
  }, []);

  const loadStudents = useCallback(async () => {
    const data = await adminApiRoutes.students();
    setStudents(data);
    return data;
  }, []);

  const loadInterviewers = useCallback(async () => {
    const data = await adminApiRoutes.interviewers();
    setInterviewers(data);
    return data;
  }, []);

  // ── Exam actions ──────────────────────────────────────────────────────────

  /** Optimistically add a completed result and remove the exam from upcoming. */
  const submitExamResult = useCallback((resultPayload) => {
    const newResult = {
      id:         `comp_${Date.now()}`,
      date:       new Date().toISOString().split('T')[0],
      time:       new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalMarks: 100,
      status:     resultPayload.marks >= 70 ? 'Passed' : 'Needs Retake',
      ...resultPayload,
    };

    setCompletedInterviews((prev) => [newResult, ...prev]);
    setInterviews((prev) => prev.filter((i) => i.id !== resultPayload.interviewId));
    return newResult;
  }, []);

  /** Create a new interview (interviewer action — optimistic). */
  const createInterview = useCallback((payload) => {
    const newInterview = {
      id:     `int_${Date.now()}`,
      status: 'Ready',
      date:   new Date().toISOString().split('T')[0],
      time:   '10:00 AM IST',
      ...payload,
    };
    setInterviews((prev) => [newInterview, ...prev]);
    return newInterview;
  }, []);

  const deleteInterview = useCallback((id) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ── Admin student/interviewer actions (optimistic) ────────────────────────

  const addStudent = useCallback((data) => {
    const s = { id: `st_${Date.now()}`, status: 'Active', examsTaken: 0, avgScore: 'N/A', ...data };
    setStudents((prev) => [s, ...prev]);
    return s;
  }, []);

  const deleteStudent = useCallback((id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleStudentStatus = useCallback((id) => {
    setStudents((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' } : s)
    );
  }, []);

  const addInterviewer = useCallback((data) => {
    const i = { id: `int_${Date.now()}`, status: 'Active', examsCreated: 0, rating: '5.0/5', ...data };
    setInterviewers((prev) => [i, ...prev]);
    return i;
  }, []);

  const deleteInterviewer = useCallback((id) => {
    setInterviewers((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const toggleInterviewerStatus = useCallback((id) => {
    setInterviewers((prev) =>
      prev.map((i) => i.id === id
        ? { ...i, status: i.status === 'Active' ? 'Pending Approval' : 'Active' }
        : i
      )
    );
  }, []);

  // ── Feedback ──────────────────────────────────────────────────────────────

  const addFeedback = useCallback((payload) => {
    const fb = { id: `fb_${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'Reviewed', ...payload };
    setFeedbacks((prev) => [fb, ...prev]);
  }, []);

  const resolveFeedback = useCallback((id) => {
    setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, status: 'Resolved' } : f));
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <DataContext.Provider
      value={{
        // State
        interviews,
        completedInterviews,
        students,
        interviewers,
        feedbacks,
        settings,

        // Loaders
        loadInterviews,
        loadCompletedInterviews,
        loadStudents,
        loadInterviewers,

        // Actions
        createInterview,
        deleteInterview,
        submitExamResult,
        addCompletedInterview: submitExamResult,

        addStudent,
        deleteStudent,
        toggleStudentStatus,

        addInterviewer,
        deleteInterviewer,
        toggleInterviewerStatus,

        addFeedback,
        resolveFeedback,
        updateSettings,

        // Direct state setters for pages that manage their own fetch
        setInterviews,
        setCompletedInterviews,
        setStudents,
        setInterviewers,
        setFeedbacks,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
};
