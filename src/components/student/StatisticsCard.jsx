import React from 'react';

/**
 * StatisticsCard — used on Performance Analytics page.
 * Props:
 *   label       – short label
 *   value       – displayed value
 *   icon        – Lucide icon component
 *   color       – theme key
 *   subtext     – small supporting text
 */
const COLOR_MAP = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100'    },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100'   },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-100'    },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-100'  },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-100'  },
};

export default function StatisticsCard({ label, value, icon: Icon, color = 'blue', subtext }) {
  const theme = COLOR_MAP[color] ?? COLOR_MAP.blue;
  return (
    <div className={`rounded-xl p-4 border ${theme.bg} ${theme.border} flex items-center gap-4`}>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white border ${theme.border} shrink-0`}>
          <Icon className={`w-5 h-5 ${theme.text}`} />
        </div>
      )}
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-extrabold ${theme.text} leading-tight`}>{value}</p>
        {subtext && <p className="text-[10px] text-slate-500 mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}
