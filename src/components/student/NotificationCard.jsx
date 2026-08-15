import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Megaphone,
  Circle,
} from 'lucide-react';

const TYPE_CONFIG = {
  exam_assigned:   { icon: Calendar,      color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100',    label: 'Exam Assigned'   },
  result_published:{ icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Result Published' },
  warning_issued:  { icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100',   label: 'Warning Issued'  },
  schedule_updated:{ icon: Calendar,      color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-100',  label: 'Schedule Updated'},
  announcement:    { icon: Megaphone,     color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-100',   label: 'Announcement'    },
};

/**
 * NotificationCard — single notification row / card.
 * Props:
 *   notification – notification object
 *   onMarkRead   – () => void  called when marking as read
 */
export default function NotificationCard({ notification, onMarkRead }) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.announcement;
  const Icon = cfg.icon;

  const formattedTime = (() => {
    try {
      return new Date(notification.datetime).toLocaleString('en-IN', {
        day:    '2-digit',
        month:  'short',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return notification.datetime;
    }
  })();

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
        notification.read
          ? 'bg-white border-slate-200/80'
          : 'bg-blue-50/40 border-blue-200/60'
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border ${cfg.bg} ${cfg.border}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-xs font-bold leading-snug ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
            {notification.title}
          </h4>
          <span className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">{formattedTime}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">{notification.description}</p>
        <div className="flex items-center gap-3 pt-0.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
          </span>
          {!notification.read && (
            <button
              onClick={() => onMarkRead?.(notification.id)}
              className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Circle className="w-2.5 h-2.5 fill-blue-600" />
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
