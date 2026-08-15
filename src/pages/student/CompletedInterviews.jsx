import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Eye, Download, Trophy, AlertTriangle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/student/SearchBar';
import EmptyState from '../../components/student/EmptyState';
import Pagination from '../../components/student/Pagination';
import Loader from '../../components/student/Loader';
import { getCompletedExams } from '../../services/studentService';

const PAGE_SIZE = 8;

export default function CompletedInterviews() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCompletedExams();
        if (!cancelled) setExams(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load completed exams.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return exams;
    return exams.filter(
      (item) =>
        (item.company ?? item.title ?? '').toLowerCase().includes(q) ||
        (item.domain ?? '').toLowerCase().includes(q),
    );
  }, [exams, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  if (loading) return <Loader message="Loading completed exams…" />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
        <p className="text-sm font-semibold text-slate-700">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#374151] text-white text-xs font-semibold rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">

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
      {exams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Completed', value: exams.length,
              color: 'text-blue-700 bg-blue-50 border-blue-100' },
            { label: 'Avg. Score',
              value: `${Math.round(exams.reduce((a, c) => a + (c.marks ?? 0), 0) / exams.length)}%`,
              color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
            { label: 'Highest Score',
              value: Math.max(...exams.map((c) => c.marks ?? 0)),
              color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
            { label: 'Best Rank',
              value: `#${Math.min(...exams.map((c) => c.rank ?? 999))}`,
              color: 'text-amber-700 bg-amber-50 border-amber-100' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl px-4 py-3 border text-center ${color}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
              <p className="text-xl font-extrabold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

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
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.company ?? item.title ?? 'Examination'}</td>
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
                          <Trophy className="w-3 h-3 text-amber-500" />#{item.rank ?? 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[11px] font-semibold ${(item.violationsCount ?? 0) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.proctoringScore ?? '—'}
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
                            <Eye className="w-3.5 h-3.5" />Scorecard
                          </Link>
                          <button
                            disabled
                            title="Download report — coming soon"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 font-semibold rounded-md text-xs cursor-not-allowed"
                          >
                            <Download className="w-3.5 h-3.5" />Report
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
