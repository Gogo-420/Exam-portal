import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Calendar, CheckCircle2, Award, Trophy,
  ArrowRight, PlayCircle, Bell, BarChart2,
  Sparkles, AlertTriangle, Inbox, Clock,
} from 'lucide-react';
import DashboardCard from '../../components/student/DashboardCard';
import ExamCard from '../../components/student/ExamCard';
import ResultCard from '../../components/student/ResultCard';
import Loader from '../../components/student/Loader';
import EmptyState from '../../components/student/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { getDashboardData, getNotifications } from '../../services/studentService';

export default function StudentDashboard() {
  const { user } = useAuth();

  const [dashData,   setDashData]   = useState(null);
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [dash, notifications] = await Promise.all([
          getDashboardData(),
          getNotifications(),
        ]);
        if (cancelled) return;
        setDashData(dash);
        setNotifs(notifications.filter((n) => !n.read).slice(0, 3));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader message="Loading dashboard…" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
        <p className="text-sm font-semibold text-slate-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#374151] text-white text-xs font-semibold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const upcomingList  = dashData?.upcomingList  ?? [];
  const recentResults = dashData?.recentResults ?? [];

  return (
    <div className="space-y-6 text-slate-800">

      {/* Welcome banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Roll No: {user?.rollNo ?? 'REG-PENDING'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name ?? 'Student'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            {user?.department ?? 'Department of Engineering'} · Secure AI Proctoring session environment verified.
          </p>
        </div>
        <div className="shrink-0">
          {(dashData?.upcomingExams ?? 0) > 0 ? (
            <Link
              to="/student/upcoming"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-blue-400" />
              View Upcoming Exams
            </Link>
          ) : (
            <span className="inline-block px-4 py-2 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg border border-slate-200">
              No Pending Exams
            </span>
          )}
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Student Name"
          value={user?.name?.split(' ')[0] ?? '—'}
          icon={User}
          color="blue"
          description={user?.rollNo ?? 'Registered Account'}
        />
        <DashboardCard
          title="Upcoming Exams"
          value={dashData?.upcomingExams ?? 0}
          icon={Calendar}
          color="amber"
          description={(dashData?.upcomingExams ?? 0) > 0 ? 'Assigned by faculty' : 'No active assignments'}
        />
        <DashboardCard
          title="Completed Exams"
          value={dashData?.completedExams ?? 0}
          icon={CheckCircle2}
          color="emerald"
          description={(dashData?.completedExams ?? 0) > 0 ? 'Verified submissions' : 'No completed tests yet'}
        />
        <DashboardCard
          title="Avg. Score"
          value={(dashData?.completedExams ?? 0) > 0 ? `${dashData.avgScore}%` : 'N/A'}
          icon={Award}
          color="indigo"
          description={(dashData?.completedExams ?? 0) > 0 ? 'Cumulative performance' : 'Awaiting first assessment'}
        />
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Current Rank"
          value={dashData?.currentRank ? `#${dashData.currentRank}` : 'N/A'}
          icon={Trophy}
          color="amber"
          description="Among all exam participants"
        />
        <DashboardCard
          title="Warning Count"
          value={dashData?.warningCount ?? 0}
          icon={AlertTriangle}
          color="rose"
          description="AI proctoring flags across sessions"
        />
        <DashboardCard
          title="Total Exams"
          value={dashData?.totalExams ?? 0}
          icon={BarChart2}
          color="purple"
          description="Upcoming + completed combined"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Start Exam',     to: '/student/upcoming',    icon: PlayCircle,   color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'View Results',   to: '/student/completed',   icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700' },
            { label: 'Update Profile', to: '/student/profile',     icon: User,         color: 'bg-[#374151] hover:bg-[#1F2937]' },
            { label: 'Performance',    to: '/student/performance', icon: BarChart2,    color: 'bg-indigo-600 hover:bg-indigo-700' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl text-white text-xs font-semibold transition-colors text-center ${color}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming exams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Examinations</h3>
            {upcomingList.length > 0 && (
              <Link to="/student/upcoming" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          {upcomingList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <EmptyState
                icon={Inbox}
                title="No upcoming exams"
                message="When an interviewer assigns an assessment to your department or batch, it will appear here."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingList.slice(0, 4).map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Recent results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Results</h3>
              {recentResults.length > 0 && (
                <Link to="/student/completed" className="text-xs font-semibold text-blue-600 hover:underline">View all</Link>
              )}
            </div>
            {recentResults.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <EmptyState icon={Clock} title="No results yet" message="Results appear here once you submit an exam." />
              </div>
            ) : (
              <div className="space-y-3">
                {recentResults.slice(0, 3).map((r) => (
                  <ResultCard key={r.id} result={r} />
                ))}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
              <Link to="/student/notifications" className="text-xs font-semibold text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {notifs.length === 0 ? (
                <EmptyState icon={Bell} title="All caught up" />
              ) : (
                notifs.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
