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
import NotificationCard from '../../components/student/NotificationCard';
import Loader from '../../components/student/Loader';
import EmptyState from '../../components/student/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
// TODO: import { getDashboardData } from '../../services/studentService'; — replace mock below with real API call
import { MOCK_STUDENT_NOTIFICATIONS } from '../../utils/mockData';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { interviews, completedInterviews } = useData();
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  // Filter interviews for this student
  const studentUpcoming = interviews.filter((item) => {
    if (!user) return false;
    if (user.id === 'std_01') return true;
    if (!item.assignedStudents) return false;
    return (
      item.assignedStudents.includes(user.id) ||
      item.assignedStudents.includes(user.email) ||
      item.assignedStudents.includes(user.department) ||
      item.assignedStudents.includes('ALL')
    );
  });

  const studentCompleted = completedInterviews.filter((item) => {
    if (!user) return false;
    if (user.id === 'std_01') return true;
    return item.studentId === user.id || item.studentEmail === user.email;
  });

  useEffect(() => {
    // TODO: replace with real API call — getDashboardData()
    const timer = setTimeout(() => {
      const avgScore =
        studentCompleted.length > 0
          ? Math.round(
              studentCompleted.reduce((acc, c) => acc + (c.marks ?? 0), 0) /
                studentCompleted.length
            )
          : 0;

      setDashData({
        totalExams:     studentUpcoming.length + studentCompleted.length,
        upcomingCount:  studentUpcoming.length,
        completedCount: studentCompleted.length,
        avgScore,
        currentRank:    1,
        warningCount:   3,
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [studentUpcoming.length, studentCompleted.length]);

  const unreadNotifs = MOCK_STUDENT_NOTIFICATIONS.filter((n) => !n.read).slice(0, 3);

  if (loading) return <Loader message="Loading dashboard…" />;

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
          {dashData.upcomingCount > 0 ? (
            <Link
              to="/student/upcoming"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-blue-400" />
              <span>View Upcoming Exams</span>
            </Link>
          ) : (
            <span className="inline-block px-4 py-2 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg border border-slate-200">
              No Pending Exams
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Student Name"
          value={user?.name?.split(' ')[0] ?? 'Student'}
          icon={User}
          color="blue"
          description={user?.rollNo ?? 'Registered Account'}
        />
        <DashboardCard
          title="Upcoming Exams"
          value={dashData.upcomingCount}
          icon={Calendar}
          color="amber"
          description={dashData.upcomingCount > 0 ? 'Assigned by faculty' : 'No active assignments'}
        />
        <DashboardCard
          title="Completed Exams"
          value={dashData.completedCount}
          icon={CheckCircle2}
          color="emerald"
          description={dashData.completedCount > 0 ? 'Verified submissions' : 'No completed tests yet'}
        />
        <DashboardCard
          title="Avg. Score"
          value={dashData.completedCount > 0 ? `${dashData.avgScore}%` : 'N/A'}
          icon={Award}
          color="indigo"
          description={dashData.completedCount > 0 ? 'Cumulative performance' : 'Awaiting first assessment'}
        />
      </div>

      {/* Secondary stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Current Rank"
          value={`#${dashData.currentRank}`}
          icon={Trophy}
          color="amber"
          description="Among all exam participants"
        />
        <DashboardCard
          title="Warning Count"
          value={dashData.warningCount}
          icon={AlertTriangle}
          color="rose"
          description="AI proctoring flags across sessions"
        />
        <DashboardCard
          title="Total Exams"
          value={dashData.totalExams}
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
            { label: 'Start Exam',      to: '/student/upcoming',      icon: PlayCircle,   color: 'bg-blue-600 hover:bg-blue-700 text-white' },
            { label: 'View Results',    to: '/student/completed',     icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
            { label: 'Update Profile',  to: '/student/profile',       icon: User,         color: 'bg-[#374151] hover:bg-[#1F2937] text-white' },
            { label: 'Performance',     to: '/student/performance',   icon: BarChart2,    color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-xl text-xs font-semibold transition-colors ${color} text-center`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming exams (left 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Upcoming Examinations</h3>
            {dashData.upcomingCount > 0 && (
              <Link
                to="/student/upcoming"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View All ({dashData.upcomingCount})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {studentUpcoming.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <EmptyState
                icon={Inbox}
                title="No upcoming exams"
                message="When an interviewer assigns an assessment to your department or batch, it will appear here."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {studentUpcoming.slice(0, 4).map((exam) => (
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
              {studentCompleted.length > 0 && (
                <Link to="/student/completed" className="text-xs font-semibold text-blue-600 hover:underline">
                  View all
                </Link>
              )}
            </div>
            {studentCompleted.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
                <EmptyState icon={Clock} title="No results yet" message="Results appear here once you submit an exam." />
              </div>
            ) : (
              <div className="space-y-3">
                {studentCompleted.slice(0, 3).map((r) => (
                  <ResultCard key={r.id} result={r} />
                ))}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
              <Link to="/student/notifications" className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {unreadNotifs.length === 0 ? (
                <EmptyState icon={Bell} title="All caught up" />
              ) : (
                unreadNotifs.map((n) => (
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
