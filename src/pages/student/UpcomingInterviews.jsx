import React, { useState, useMemo } from 'react';
import { Calendar, Filter } from 'lucide-react';
import ExamCard from '../../components/student/ExamCard';
import EmptyState from '../../components/student/EmptyState';
import SearchBar from '../../components/student/SearchBar';
import Pagination from '../../components/student/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const PAGE_SIZE = 6;

const STATUS_OPTIONS = ['All', 'Ready', 'Scheduled'];

export default function UpcomingInterviews() {
  const { user } = useAuth();
  const { interviews } = useData();

  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('All');
  const [page, setPage]           = useState(1);

  // Filter for this student
  const assigned = useMemo(() => {
    return interviews.filter((item) => {
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
  }, [interviews, user]);

  const filtered = useMemo(() => {
    return assigned.filter((item) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        (item.company ?? item.title ?? '').toLowerCase().includes(q) ||
        (item.domain ?? '').toLowerCase().includes(q) ||
        (item.code ?? '').toLowerCase().includes(q);
      const matchS = status === 'All' || item.status === status;
      return matchQ && matchS;
    });
  }, [assigned, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleStatus = (v) => { setStatus(v); setPage(1); };

  return (
    <div className="space-y-6 text-slate-800">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upcoming Exams</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scheduled AI-proctored assessments assigned to your account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
            {filtered.length} exam{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
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

      {/* Grid or empty */}
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
            {paginated.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
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
