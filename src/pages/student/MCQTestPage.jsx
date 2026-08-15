import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Send,
  AlertTriangle,
  Sparkles,
  Camera,
  Eye,
  ShieldAlert,
  VideoOff,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Loader from '../../components/student/Loader';
import { getExamQuestions } from '../../services/studentService';
import { MOCK_MCQ_QUESTIONS } from '../../utils/mockData';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function MCQTestPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const { user } = useAuth();
  const { interviews, submitExamResult } = useData();

  // Resolve interview object — no hardcoded fallback strings
  const interviewData = interviews.find((item) => item.id === interviewId) ?? null;

  // ── Questions ────────────────────────────────────────────────────────────
  const [questions,      setQuestions]      = useState([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [currentIndex,   setCurrentIndex]   = useState(0);

  // ── Answers & review ─────────────────────────────────────────────────────
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [reviewSet,        setReviewSet]       = useState(new Set());

  // ── Timer ─────────────────────────────────────────────────────────────────
  const durationSeconds = (() => {
    const raw   = interviewData?.duration ?? '45 Mins';
    const match = String(raw).match(/(\d+)/);
    return match ? parseInt(match[1], 10) * 60 : 2700;
  })();
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  // ── Webcam / mic ──────────────────────────────────────────────────────────
  const videoRef            = useRef(null);
  const canvasRef           = useRef(null);
  const streamRef           = useRef(null);
  const audioContextRef     = useRef(null);
  const analyserRef         = useRef(null);
  const audioDataRef        = useRef(null);
  const micCheckIntervalRef = useRef(null);
  const [cameraActive,     setCameraActive]     = useState(false);
  const [micActive,        setMicActive]        = useState(false);
  const [micLevel,         setMicLevel]         = useState(0);
  const [audioAlertActive, setAudioAlertActive] = useState(false);
  const lastAudioWarningRef = useRef(0);

  // ── Face detection ────────────────────────────────────────────────────────
  // simulationHoldUntilRef removed — no demo simulation in production
  const [faceStatus, setFaceStatus]   = useState('detected');
  const noFaceTimerRef     = useRef(null);
  const noFaceStartTimeRef = useRef(null);

  // ── Violations ────────────────────────────────────────────────────────────
  const [warningCount,      setWarningCount]      = useState(0);
  const maxWarnings = 3;
  const [warningModalOpen,   setWarningModalOpen]   = useState(false);
  const [activeWarningTitle, setActiveWarningTitle] = useState('');
  const [activeWarningMsg,   setActiveWarningMsg]   = useState('');
  const [violationsLog,      setViolationsLog]      = useState([]);
  const lastWarningTimeRef  = useRef(0);

  // ── Fullscreen & submit ───────────────────────────────────────────────────
  const [isFullscreen,   setIsFullscreen]   = useState(true);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const recordViolation = (type, description) => {
    const now = Date.now();
    if (now - lastWarningTimeRef.current < 2000) return;
    lastWarningTimeRef.current = now;

    const newViolation = { id: `viol_${now}`, time: formatTime(timeLeft), type, description, timestamp: new Date().toLocaleTimeString() };
    setViolationsLog((prev) => [...prev, newViolation]);

    setWarningCount((prev) => {
      const updated = prev + 1;
      setActiveWarningTitle(`Proctor Violation Alert (${updated}/${maxWarnings})`);
      setActiveWarningMsg(description);
      setWarningModalOpen(true);
      if (updated >= maxWarnings) {
        setTimeout(() => handleFinalSubmit('Auto-Submitted: Maximum Violation Limit Reached'), 1200);
      }
      return updated;
    });
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => { try { t.stop(); t.enabled = false; } catch (_) {} });
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (audioContextRef.current) { try { audioContextRef.current.close(); } catch (_) {} audioContextRef.current = null; }
    setCameraActive(false);
    setMicActive(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Load questions on mount
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1. Use questions already attached to the interview object
      if (interviewData?.questions?.length) {
        if (!cancelled) { setQuestions(interviewData.questions); setQuestionsReady(true); }
        return;
      }
      // 2. Fetch via service layer (real API → dev mock fallback)
      try {
        const fetched = await getExamQuestions(interviewId);
        if (!cancelled) {
          setQuestions(fetched?.length ? fetched : MOCK_MCQ_QUESTIONS);
          setQuestionsReady(true);
        }
      } catch {
        if (!cancelled) { setQuestions(MOCK_MCQ_QUESTIONS); setQuestionsReady(true); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [interviewId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // Webcam + microphone init
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true;
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        if (isMounted) { setCameraActive(true); setMicActive(true); }

        // Audio analyser
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.4;
          source.connect(analyser);
          analyserRef.current = analyser;
          audioDataRef.current = new Uint8Array(analyser.fftSize);
        } catch (_) {}

        const vt = stream.getVideoTracks()[0];
        if (vt) {
          vt.onended = () => { if (isMounted) { setCameraActive(false); recordViolation('Camera Disconnected', 'Webcam stream was disconnected!'); } };
          vt.onmute  = () => { if (isMounted) recordViolation('Camera Muted', 'Webcam video was muted by the device.'); };
        }
        const at = stream.getAudioTracks()[0];
        if (at) at.onended = () => { if (isMounted) setMicActive(false); };
      } catch (_) {
        if (isMounted) setCameraActive(true); // sandbox fallback
      }
    };
    startMedia();
    return () => { isMounted = false; stopCameraStream(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic health check
  useEffect(() => {
    const iv = setInterval(() => {
      if (!streamRef.current) return;
      const vt = streamRef.current.getVideoTracks()[0];
      if (!vt || vt.readyState !== 'live' || !vt.enabled) { setCameraActive(false); recordViolation('Camera Inactive', 'Webcam feed is inactive or blocked.'); }
      else setCameraActive(true);
      const at = streamRef.current.getAudioTracks()[0];
      setMicActive(!!(at && at.readyState === 'live' && at.enabled));
    }, 4000);
    return () => clearInterval(iv);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Microphone audio level monitor
  useEffect(() => {
    const SPEECH_THRESHOLD = 18;
    const COOLDOWN = 12000;
    micCheckIntervalRef.current = setInterval(() => {
      if (!analyserRef.current || !audioDataRef.current) return;
      analyserRef.current.getByteTimeDomainData(audioDataRef.current);
      let sum = 0;
      for (let i = 0; i < audioDataRef.current.length; i++) {
        const n = (audioDataRef.current[i] - 128) / 128;
        sum += n * n;
      }
      const rms = Math.round(Math.sqrt(sum / audioDataRef.current.length) * 100);
      setMicLevel(rms);
      setAudioAlertActive(rms > SPEECH_THRESHOLD);
      if (rms > SPEECH_THRESHOLD && Date.now() - lastAudioWarningRef.current > COOLDOWN) {
        lastAudioWarningRef.current = Date.now();
        recordViolation('Audio / Speech Detected', `Audible noise detected by microphone (level: ${rms}/100). Talking is a violation.`);
      }
    }, 1500);
    return () => { if (micCheckIntervalRef.current) clearInterval(micCheckIntervalRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // Face detection (YCbCr pixel analysis fallback)
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !cameraActive) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState < 2) return;
      const ctx = canvas.getContext('2d');
      const w = 160, h = 120;
      canvas.width = w; canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      if ('FaceDetector' in window) {
        try {
          // @ts-ignore
          const fd = new window.FaceDetector({ fastMode: true });
          const faces = await fd.detect(video);
          setFaceStatus(faces.length === 1 ? 'detected' : faces.length === 0 ? 'no_face' : 'multi_face');
          return;
        } catch (_) {}
      }

      const { data: px } = ctx.getImageData(0, 0, w, h);
      let lum = 0, total = 0, skin = 0, left = 0, right = 0;
      for (let y = Math.floor(h * 0.10); y < Math.floor(h * 0.90); y += 2) {
        for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x += 2) {
          const i = (y * w + x) * 4;
          const [r, g, b] = [px[i], px[i+1], px[i+2]];
          const br = (r + g + b) / 3;
          lum += br; total++;
          const cb = 128 - 0.168736*r - 0.331264*g + 0.5*b;
          const cr = 128 + 0.5*r - 0.418688*g - 0.081312*b;
          if (cr >= 133 && cr <= 173 && cb >= 77 && cb <= 127 && br > 20 && br < 245) {
            skin++;
            if (x < w * 0.4) left++;
            if (x > w * 0.6) right++;
          }
        }
      }
      const avgBr = total > 0 ? lum / total : 0;
      const sr    = total > 0 ? (skin  / total) * 100 : 0;
      const lr    = total > 0 ? (left  / total) * 100 : 0;
      const rr    = total > 0 ? (right / total) * 100 : 0;

      if (avgBr < 15)                               { setFaceStatus('no_face');    return; }
      if (sr < 3.5)                                 { setFaceStatus('no_face');    return; }
      if (lr > 8.0 && rr > 8.0 && sr > 25.0)       { setFaceStatus('multi_face'); return; }
      setFaceStatus('detected');
    };
    const iv = setInterval(processFrame, 800);
    return () => clearInterval(iv);
  }, [cameraActive]);

  useEffect(() => {
    if (faceStatus === 'no_face') {
      if (!noFaceStartTimeRef.current) noFaceStartTimeRef.current = Date.now();
      noFaceTimerRef.current = setInterval(() => {
        if (noFaceStartTimeRef.current && Date.now() - noFaceStartTimeRef.current >= 3000) {
          recordViolation('Face Not Found', 'No candidate face detected for over 3 seconds.');
          clearInterval(noFaceTimerRef.current);
          noFaceStartTimeRef.current = null;
        }
      }, 500);
    } else {
      if (noFaceTimerRef.current) clearInterval(noFaceTimerRef.current);
      noFaceStartTimeRef.current = null;
    }
    if (faceStatus === 'multi_face') recordViolation('Multiple Faces Detected', 'Multiple individuals detected in webcam stream.');
    return () => { if (noFaceTimerRef.current) clearInterval(noFaceTimerRef.current); };
  }, [faceStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────
  // Tab / focus / fullscreen guards
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onHidden = () => { if (document.hidden) recordViolation('Tab Switch', 'Tab switching or window minimization detected.'); };
    const onBlur   = () => recordViolation('Window Blur', 'Browser window lost focus.');
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('blur', onBlur);
    return () => { document.removeEventListener('visibilitychange', onHidden); window.removeEventListener('blur', onBlur); };
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try { if (document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); } catch (_) {}
    const onFsChange = () => {
      if (!document.fullscreenElement) { setIsFullscreen(false); recordViolation('Fullscreen Exited', 'Fullscreen mode was exited.'); }
      else setIsFullscreen(true);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const reenterFullscreen = () => {
    try { document.documentElement.requestFullscreen?.(); } catch (_) {}
    setIsFullscreen(true);
    setWarningModalOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Timer
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (timeLeft <= 0) { handleFinalSubmit(`Timer Expired (${Math.round(durationSeconds / 60)} Minutes)`); return; }
    const iv = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(iv);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = 'Leaving will auto-submit your exam.'; return e.returnValue; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Answer helpers
  // ─────────────────────────────────────────────────────────────────────────

  const handleSelectOption = (optIdx) => {
    if (!questions[currentIndex]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questions[currentIndex].id]: optIdx }));
  };

  const toggleReviewMark = () => {
    if (!questions[currentIndex]) return;
    setReviewSet((prev) => {
      const s = new Set(prev);
      s.has(questions[currentIndex].id) ? s.delete(questions[currentIndex].id) : s.add(questions[currentIndex].id);
      return s;
    });
  };

  const clearResponse = () => {
    if (!questions[currentIndex]) return;
    setSelectedAnswers((prev) => { const c = { ...prev }; delete c[questions[currentIndex].id]; return c; });
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  // ─────────────────────────────────────────────────────────────────────────
  // Final submission
  // ─────────────────────────────────────────────────────────────────────────

  const handleFinalSubmit = (reason) => {
    stopCameraStream();
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (_) {}

    let correct = 0;
    questions.forEach((q) => { if (selectedAnswers[q.id] === q.correctAnswer) correct++; });

    const total   = questions.length;
    const score   = total > 0 ? Math.round((correct / total) * 100) : 0;
    const elapsed = durationSeconds - timeLeft;
    const timeTaken = `${Math.floor(elapsed / 60)} Mins ${elapsed % 60} Secs`;

    const payload = {
      interviewId:    interviewData?.id     ?? interviewId,
      studentName:    user?.name            ?? '',
      studentEmail:   user?.email           ?? '',
      rollNo:         user?.rollNo          ?? '',
      company:        interviewData?.company ?? interviewData?.title ?? '',
      title:          interviewData?.title   ?? interviewData?.company ?? '',
      domain:         interviewData?.domain  ?? '',
      code:           interviewData?.code    ?? '',
      date:           new Date().toISOString().split('T')[0],
      time:           new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      marks:          score,
      totalMarks:     100,
      percentage:     score,
      correctAnswers: correct,
      wrongAnswers:   total - correct - (total - answeredCount),
      unanswered:     total - answeredCount,
      totalQuestions: total,
      timeTaken,
      violationsCount: warningCount,
      violationsList:  violationsLog,
      userAnswers:     selectedAnswers,
      questions,
      status:
        warningCount >= maxWarnings
          ? 'Auto-Submitted (Violations Limit Exceeded)'
          : reason
          ? `Submitted (${reason})`
          : score >= 70 ? 'Passed' : 'Needs Retake',
      proctoringScore: warningCount === 0 ? '100% Clean' : `${Math.max(0, 100 - warningCount * 25)}% Clean`,
    };

    const result = submitExamResult(payload);
    navigate(`/student/results/${result.id}`);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render guards
  // ─────────────────────────────────────────────────────────────────────────

  if (!questionsReady) return <Loader message="Loading examination questions…" />;
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No questions found for this exam.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-3 sm:p-5 lg:p-6 space-y-5 max-w-7xl mx-auto text-slate-800 selection:bg-blue-100">
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Top header ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
              {interviewData?.code ?? 'EXAM'} · PROCTORED
            </span>
            <span className="text-[10px] font-bold text-slate-500">Candidate: {user?.name ?? ''}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 mt-0.5 tracking-tight">
            {interviewData?.company ?? interviewData?.title ?? 'Secure Examination'}
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Proctor Active
          </div>
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-bold text-xs border ${
            timeLeft < 300 ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-slate-900 text-white border-slate-800'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Question panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">

            {/* Progress */}
            <div className="space-y-3 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={toggleReviewMark}
                  className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                    reviewSet.has(currentQuestion.id)
                      ? 'bg-amber-100 text-amber-800 border border-amber-200 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {reviewSet.has(currentQuestion.id) ? 'Marked for Review' : 'Mark for Review'}
                </button>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{currentQuestion.question}</h3>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, optIdx) => {
                const selected = selectedAnswers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3.5 rounded-lg text-left border text-xs font-medium transition-colors flex items-center justify-between ${
                      selected
                        ? 'border-blue-600 bg-blue-50 text-slate-900 font-bold shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${selected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      {opt}
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="pt-5 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <button onClick={clearResponse} className="text-xs font-medium text-slate-500 hover:text-slate-800">
                Clear Response
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  disabled={currentIndex === 0}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-medium text-xs rounded-md transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                    className="px-4 py-1.5 bg-[#374151] hover:bg-[#1F2937] text-white font-medium text-xs rounded-md shadow-xs transition-colors flex items-center gap-1"
                  >
                    Next Question <ChevronRight className="w-4 h-4 text-blue-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSubmitModalOpen(true)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Proctoring panel */}
        <div className="space-y-4">

          {/* Live feed */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Camera className="w-4 h-4 text-blue-600" /> Live Proctoring Feed
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${cameraActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {cameraActive ? 'CAM ON' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="w-full h-36 bg-slate-900 rounded-lg overflow-hidden relative border border-slate-300 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`} />
              {!cameraActive && (
                <div className="text-center text-red-400 space-y-1">
                  <VideoOff className="w-8 h-8 mx-auto" />
                  <p className="text-[11px] font-bold">Camera Interrupted</p>
                </div>
              )}
              {cameraActive && (
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                  <div className="px-2 py-0.5 bg-slate-900/90 text-white text-[9px] font-bold rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> REC
                  </div>
                  {faceStatus === 'detected'   && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">✅ Face OK</span>}
                  {faceStatus === 'no_face'    && <span className="px-2 py-0.5 bg-red-600    text-white text-[10px] font-bold rounded animate-pulse">❌ No Face</span>}
                  {faceStatus === 'multi_face' && <span className="px-2 py-0.5 bg-amber-500  text-white text-[10px] font-bold rounded animate-pulse">⚠ Multi-Face</span>}
                </div>
              )}
            </div>

            {/* Violations counter */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Violations:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs ${warningCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {warningCount} / {maxWarnings}
              </span>
            </div>

            {/* Person visibility */}
            <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
              faceStatus === 'detected' ? 'bg-emerald-50 border-emerald-200' : faceStatus === 'multi_face' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-1.5">
                <Eye className={`w-3.5 h-3.5 ${faceStatus === 'detected' ? 'text-emerald-600' : faceStatus === 'multi_face' ? 'text-amber-600' : 'text-red-500'}`} />
                <span className={`font-semibold text-[11px] ${faceStatus === 'detected' ? 'text-emerald-800' : faceStatus === 'multi_face' ? 'text-amber-800' : 'text-red-700'}`}>
                  {faceStatus === 'detected' && 'Person Visible'}
                  {faceStatus === 'no_face'   && 'No Person Detected'}
                  {faceStatus === 'multi_face' && 'Multiple People'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${faceStatus === 'detected' ? 'bg-emerald-100 text-emerald-800' : faceStatus === 'multi_face' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>
                {faceStatus === 'detected' ? 'OK' : faceStatus === 'multi_face' ? 'WARN' : 'FAIL'}
              </span>
            </div>

            {/* Mic monitor */}
            <div className={`p-2.5 rounded-lg border space-y-1.5 ${audioAlertActive ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className={`w-3.5 h-3.5 ${audioAlertActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className={`font-semibold ${audioAlertActive ? 'text-amber-800' : 'text-slate-600'}`}>
                    {micActive ? (audioAlertActive ? 'Speech Detected!' : 'Mic Monitoring') : 'Mic Inactive'}
                  </span>
                </div>
                <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${!micActive ? 'bg-slate-200 text-slate-500' : audioAlertActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                  {micActive ? (audioAlertActive ? 'FLAGGED' : 'CLEAN') : 'OFF'}
                </span>
              </div>
              {micActive && (
                <div className="space-y-0.5">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${micLevel > 40 ? 'bg-red-500' : micLevel > 18 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, micLevel * 2)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 text-right font-mono">
                    Level: {micLevel}/100{audioAlertActive ? ' — talking detected' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Question navigator */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Question Navigator</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-slate-500">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Answered ({answeredCount})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500  inline-block" /> Review ({reviewSet.size})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200  inline-block" /> Unanswered ({questions.length - answeredCount})</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600   inline-block" /> Current</div>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {questions.map((q, idx) => {
                const isCur = idx === currentIndex;
                const isAns = selectedAnswers[q.id] !== undefined;
                const isMkd = reviewSet.has(q.id);
                const cls = isCur ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300'
                  : isMkd ? 'bg-amber-500 text-white font-bold'
                  : isAns ? 'bg-emerald-600 text-white font-bold'
                  :         'bg-slate-100 text-slate-700 hover:bg-slate-200';
                return (
                  <button key={q.id} onClick={() => setCurrentIndex(idx)} className={`h-8 rounded text-xs transition-colors flex items-center justify-center ${cls}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Send className="w-3.5 h-3.5" /> Submit Examination
            </button>
          </div>
        </div>
      </div>

      {/* ── Warning modal ───────────────────────────────────────────────── */}
      {warningModalOpen && (
        <Modal isOpen={warningModalOpen} onClose={() => setWarningModalOpen(false)} title="⚠️ AI Proctoring Security Warning">
          <div className="text-center py-2 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">{activeWarningTitle}</h4>
              <p className="text-slate-600 font-medium bg-red-50 p-2.5 rounded border border-red-100 text-xs">{activeWarningMsg}</p>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Tab switching, loss of face detection, or exiting fullscreen are prohibited.
              <br />
              <strong className="text-red-600 font-bold">Warning {warningCount} of {maxWarnings} maximum allowed.</strong>
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {!isFullscreen && (
                <button onClick={reenterFullscreen} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md">
                  Re-Enter Fullscreen
                </button>
              )}
              <button onClick={() => setWarningModalOpen(false)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md">
                Acknowledge & Resume
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Submit confirmation modal ───────────────────────────────────── */}
      {submitModalOpen && (
        <Modal isOpen={submitModalOpen} onClose={() => setSubmitModalOpen(false)} title="Confirm Examination Submission">
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 text-sm">Are you sure you want to finalise and submit your examination paper?</p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Total Questions:</span><span className="font-bold">{questions.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Answered:</span><span className="font-bold text-emerald-600">{answeredCount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Unanswered:</span><span className="font-bold text-red-600">{questions.length - answeredCount}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5"><span className="text-slate-500">Proctor Flags:</span><span className={`font-bold ${warningCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{warningCount} warnings</span></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSubmitModalOpen(false)} className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium border border-slate-200">
                Return to Test
              </button>
              <button onClick={() => handleFinalSubmit('Student Action')} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md shadow-xs">
                Confirm & Submit
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
