import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Trophy, Target, AlertTriangle,
  BookOpen, BarChart2, Award, Activity,
} from 'lucide-react';
import ChartCard from '../../components/student/ChartCard';
import StatisticsCard from '../../components/student/StatisticsCard';
import Loader from '../../components/student/Loader';
import { getPerformanceData } from '../../services/studentService';

// Custom tooltip shared by multiple charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-bold text-slate-700 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}{p.unit ?? ''}
        </p>
      ))}
    </div>
  );
};

export default function PerformancePage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await getPerformanceData();
        if (!cancelled) { setData(result); setLoading(false); }
      } catch (err) {
        if (!cancelled) { setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader message="Loading performance analytics…" />;
  if (!data)   return <p className="text-xs text-slate-500 p-6">No data available.</p>;

  const { marksTrend, rankTrend, examsAttempted, warningStats, stats } = data;

  return (
    <div className="space-y-6 text-slate-800">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Marks trend, rank progression, exam history, and AI proctoring statistics.
        </p>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatisticsCard label="Avg. Score"     value={`${stats.avgScore}%`}         icon={Target}    color="blue"    subtext="Cumulative" />
        <StatisticsCard label="Highest Score"  value={`${stats.highestScore}`}       icon={Award}     color="emerald" subtext="Best performance" />
        <StatisticsCard label="Lowest Score"   value={`${stats.lowestScore}`}        icon={TrendingUp} color="amber"  subtext="Needs improvement" />
        <StatisticsCard label="Total Exams"    value={stats.totalExams}              icon={BookOpen}  color="indigo"  subtext="Attempted" />
        <StatisticsCard label="Warning Count"  value={stats.warningCount}            icon={AlertTriangle} color="rose" subtext="AI flags total" />
      </div>

      {/* Rank summary strip */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Current Rank</p>
            <p className="text-2xl font-extrabold text-amber-600">#{stats.currentRank}</p>
            <p className="text-[10px] text-slate-400">Among {stats.totalStudents} participants</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Score Trend</p>
            <p className="text-2xl font-extrabold text-blue-600">↑ Improving</p>
            <p className="text-[10px] text-slate-400">Based on last 4 exams</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pass Rate</p>
            <p className="text-2xl font-extrabold text-emerald-600">100%</p>
            <p className="text-[10px] text-slate-400">All exams passed</p>
          </div>
        </div>
      </div>

      {/* Charts row 1 — Marks + Rank trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Marks Trend */}
        <ChartCard
          title="Marks Trend"
          subtitle="Score progression across completed exams"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={marksTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="marks"
                name="Marks"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rank Trend */}
        <ChartCard
          title="Rank Trend"
          subtitle="Lower rank = better — track your progression"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={rankTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis reversed domain={[1, 12]} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rank"
                name="Rank"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 — Exams attempted + Warning distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Exams Attempted per Month */}
        <ChartCard
          title="Exams Attempted"
          subtitle="Monthly examination activity"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={examsAttempted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Exams" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Warning Statistics */}
        <ChartCard
          title="Proctoring Warning Statistics"
          subtitle="AI monitoring session classification"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={warningStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {warningStats.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} session(s)`, '']} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2">
              {warningStats.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.fill }} />
                    <span className="text-slate-600 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Marks table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Exam-by-Exam Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Exam</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Marks</th>
                <th className="py-3 px-4 text-center">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {marksTrend.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.exam}</td>
                  <td className="py-3 px-4 text-slate-500">{row.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-blue-600">{row.marks}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-amber-600">
                      #{rankTrend[i]?.rank ?? 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
