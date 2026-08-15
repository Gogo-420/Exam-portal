import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  Bell,
  User,
  BarChart2,
  Settings,
  LogOut,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { name: 'Dashboard',        path: '/student/dashboard',     icon: LayoutDashboard },
  { name: 'Upcoming Exams',   path: '/student/upcoming',      icon: Calendar        },
  { name: 'Completed Exams',  path: '/student/completed',     icon: CheckCircle2    },
  { name: 'Notifications',    path: '/student/notifications', icon: Bell            },
  { name: 'Performance',      path: '/student/performance',   icon: BarChart2       },
  { name: 'Profile',          path: '/student/profile',       icon: User            },
  { name: 'Settings',         path: '/student/settings',      icon: Settings        },
];

export default function StudentSidebar({ mobileOpen, setMobileOpen, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#1F2937] border-r border-slate-700/60 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-700/60 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm shrink-0">
            <Shield className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-semibold text-white tracking-tight text-sm leading-tight">Secure AI Exam</div>
            <div className="text-[10px] text-slate-400 font-medium">Student Portal</div>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-3 mb-1 p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-center space-x-3">
          <img
            src={
              user?.avatar ??
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
            }
            alt={user?.name ?? 'Student'}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-600 shrink-0"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{user?.name ?? 'Student'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.rollNo ?? user?.email}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Navigation
          </div>

          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const showBadge = link.path === '/student/notifications' && unreadCount > 0;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#374151] text-white border-l-2 border-[#2563EB] pl-[10px]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <span className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </span>
                {showBadge && (
                  <span className="ml-auto w-4 h-4 text-[9px] font-bold rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* AI status strip */}
        <div className="p-3 m-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs space-y-1 text-slate-300">
          <div className="flex items-center space-x-1.5 font-medium text-blue-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Proctoring Engine</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">Compliance &amp; verification active.</p>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
