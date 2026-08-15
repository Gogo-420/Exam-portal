import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, User, Settings, LogOut, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_STUDENT_NOTIFICATIONS } from '../../utils/mockData';

export default function StudentHeader({ setMobileOpen, unreadCount = 0, onMarkAllRead }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recentNotifs = MOCK_STUDENT_NOTIFICATIONS.slice(0, 4);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

      {/* Left: mobile menu + page title */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            Student Examination Portal
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            AI-proctored secure examination platform
          </p>
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center space-x-2 shrink-0">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold rounded-full bg-blue-600 text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => { onMarkAllRead?.(); setNotifOpen(false); }}
                      className="text-[10px] font-semibold text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <Link
                    to="/student/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-800"
                  >
                    View all
                  </Link>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {recentNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 text-xs space-y-0.5 hover:bg-slate-50 transition-colors ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 leading-snug">{n.title}</span>
                      {!n.read && (
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{n.description}</p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                <Link
                  to="/student/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  See all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center space-x-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
            aria-label="Profile menu"
          >
            <img
              src={
                user?.avatar ??
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
              }
              alt={user?.name ?? 'Student'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[110px] truncate">
                {user?.name ?? 'Student'}
              </div>
              <div className="text-[10px] text-blue-600 font-medium">Student</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/student/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                My Profile
              </Link>
              <Link
                to="/student/performance"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Performance
              </Link>
              <Link
                to="/student/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              <div className="border-t border-slate-100 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
