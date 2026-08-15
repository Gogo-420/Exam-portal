import React from 'react';

/**
 * ChartCard — wrapper card for Recharts chart components.
 * Props:
 *   title    – card heading
 *   subtitle – optional supporting text
 *   children – chart JSX
 *   action   – optional right-side element
 */
export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
