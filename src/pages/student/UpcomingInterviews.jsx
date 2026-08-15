import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Filter, AlertTriangle } from 'lucide-react';
import ExamCard from '../../components/student/ExamCard';
import EmptyState from '../../components/student/EmptyState';
import SearchBar from '../../components/student/SearchBar';
import Pagination from '../../components/student/Pagination';
import Loader from '../../components/student/Loader';
import { getUpcomingExams } from '../../services/studentService';

const PAGE_SIZE      = 6;
const STATUS_OPTIONS = ['All', 'Ready', 'Scheduled'];

export default function UpcomingInterviews() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('All');
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getUpcomingExams();
        if (!cancelled) setExams(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load upcoming exams.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return exams.filter((item) => {
      const matchQ =
        !q ||
        (item.company ?? item.title ?? '').toLowerCase().includes(q) ||
        (item.domain ?? '').toLowerCase().includes(q) ||
        (item.code   ?? '').toLowerCase().includes(q);
      const matchS = status === 'All' || item.status === status;
      return matchQ && matchS;
    });
  }, [exams, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleStatus = (v) => { setStatus(v); setPage(1); };

  if (loading) return <Loader message="Loading upcoming exams…" />;

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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Exams</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled AI-proctored assessments assigned to your account.
          </p>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-medium self-start sm:self-auto">
          {filtered.length} exam{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search by exam name or domain…"
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  status === s
                    ? 'bg-[#374151] text-white border-[#374151]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <EmptyState
            icon={Calendar}
            title={search || status !== 'All' ? 'No exams match your filter' : 'No upcoming exams'}
            message={
              search || status !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'When an interviewer assigns an assessment to your department or batch, it will appear here.'
            }
            action={
              (search || status !== 'All')
                ? { label: 'Clear filters', onClick: () => { setSearch(''); setStatus('All'); } }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginated.map((exam) => <ExamCard key={exam.id} exam={exam} />)}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
