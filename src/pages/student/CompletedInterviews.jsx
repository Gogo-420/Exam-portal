import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, Download, Trophy } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/student/SearchBar';
import EmptyState from '../../components/student/EmptyState';
import Pagination from '../../components/student/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const PAGE_SIZE = 8;

export default function CompletedInterviews() {
  const { user } = useAuth();
  const { completedInterviews } = useData();
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const studentCompleted = useMemo(() => {
    return completedInterviews.filter((item) => {
      if (!user) return false;
      if (user.id === 'std_01') return true;
      return item.studentId === user.id || item.studentEmail === user.email;
    });
  }, [completedInterviews, user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return studentCompleted;
    return studentCompleted.filter(
      (item) =>
        (item.company ?? item.title ?? '').toLowerCase().includes(q) ||
        (item.domain ?? '').toLowerCase().includes(q)
    );
  }, [studentCompleted, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="space-y-6 text-slate-800">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Completed Exams</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official scorecards, rank log, and AI proctor cleanliness reports.
          </p>
        </div>
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search completed exams…"
          className="w-full sm:w-64"
        />
      </div>

      {/* Summary strip */}
      {studentCompleted.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Completed', value: studentCompleted.length, color: 'text-blue-700 bg-blue-50 border-blue-100' },
            {
              label: 'Avg. Score',
              value: `${Math.round(studentCompleted.reduce((a, c) => a + (c.marks ?? 0), 0) / studentCompleted.length)}%`,
              color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
            },
            {
              label: 'Highest Score',
              value: `${Math.max(...studentCompleted.map((c) => c.marks ?? 0))}`,
              color: 'text-indigo-700 bg-indigo-50 border-indigo-100',
            },
            {
              label: 'Best Rank',
              value: `#${Math.min(...studentCompleted.map((c) => c.rank ?? 999))}`,
              color: 'text-amber-700 bg-amber-50 border-amber-100',
            },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl px-4 py-3 border text-center ${color}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
              <p className="text-xl font-extrabold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table / empty */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={search ? 'No results match your search' : 'No completed examinations'}
            message={
              search
                ? 'Try adjusting your search query.'
                : 'Scorecards are automatically published here once you submit an examination.'
            }
            action={search ? { label: 'Clear search', onClick: () => setSearch('') } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Exam / Organisation</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Marks</th>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4 text-center">Proctor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {paginated.map((item) => {
                  const pct = item.percentage ?? Math.round(((item.marks ?? 0) / (item.totalMarks ?? 100)) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.company ?? item.title ?? 'Examination'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.domain}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.date}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-blue-600 text-sm">{item.marks ?? 0}</span>
                        <span className="text-[10px] text-slate-400"> / {item.totalMarks ?? 100}</span>
                        <div className="w-full bg-slate-100 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : 'bg-rose-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-[11px]">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          #{item.rank ?? 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[11px] font-semibold ${
                            (item.violationsCount ?? 0) === 0 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.proctoringScore ?? '100% Clean'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="emerald" size="sm">{item.status ?? 'Passed'}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/student/results/${item.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-md transition-colors text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Scorecard
                          </Link>
                          <button
                            disabled
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 font-semibold rounded-md text-xs cursor-not-allowed"
                            title="Download report — coming soon"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
