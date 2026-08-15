import React, { useState, useMemo } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import NotificationCard from '../../components/student/NotificationCard';
import EmptyState from '../../components/student/EmptyState';
import SearchBar from '../../components/student/SearchBar';
import Pagination from '../../components/student/Pagination';
import { MOCK_STUDENT_NOTIFICATIONS } from '../../utils/mockData';

const PAGE_SIZE = 6;

const TYPE_LABELS = {
  all:              'All',
  exam_assigned:    'Exam Assigned',
  result_published: 'Results',
  warning_issued:   'Warnings',
  schedule_updated: 'Schedule',
  announcement:     'Announcements',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_STUDENT_NOTIFICATIONS);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [page, setPage]       = useState(1);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) => {
    // TODO: await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    // TODO: await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notifications.filter((n) => {
      const matchQ =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q);
      const matchF = filter === 'all' || n.type === filter;
      return matchQ && matchF;
    });
  }, [notifications, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleFilter = (v) => { setFilter(v); setPage(1); };

  return (
    <div className="space-y-6 text-slate-800">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exam assignments, results, warnings, and announcements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
              {unreadCount} unread
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search notifications…"
          className="w-full sm:w-64"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                filter === key
                  ? 'bg-[#374151] text-white border-[#374151]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <EmptyState
            icon={Bell}
            title={search || filter !== 'all' ? 'No notifications match' : 'No notifications yet'}
            message={
              search || filter !== 'all'
                ? 'Try adjusting your filter or search.'
                : 'You will be notified here about new exams, results, warnings, and announcements.'
            }
            action={
              search || filter !== 'all'
                ? { label: 'Clear filters', onClick: () => { setSearch(''); setFilter('all'); } }
                : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      )}

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
