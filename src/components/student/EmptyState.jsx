import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — shown when a list or data section has no items.
 * Props:
 *   icon    – Lucide icon component (defaults to Inbox)
 *   title   – headline text
 *   message – supporting description
 *   action  – optional { label, onClick } button
 */
export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        {message && <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{message}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-4 py-2 bg-[#374151] hover:bg-[#1F2937] text-white text-xs font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
