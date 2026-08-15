import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Eye, ShieldCheck, Download } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * ResultCard — compact card showing a completed exam result.
 * Props:
 *   result – completed interview/result object
 */
export default function ResultCard({ result }) {
  const pct = result.percentage ?? Math.round(((result.marks ?? 0) / (result.totalMarks ?? 100)) * 100);
  const scoreColor =
    pct >= 85 ? 'text-emerald-700' :
    pct >= 70 ? 'text-blue-700'    :
                'text-rose-700';

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {result.company ?? result.title ?? 'Examination'}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">{result.domain}</p>
        </div>
        <Badge variant="emerald" size="sm">{result.status ?? 'Passed'}</Badge>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
        <div className="text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Score</p>
          <p className={`text-lg font-extrabold ${scoreColor}`}>{result.marks ?? 0}<span className="text-xs font-normal text-slate-400">/{result.totalMarks ?? 100}</span></p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Rank</p>
          <p className="text-sm font-bold text-amber-600 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />#{result.rank ?? 'N/A'}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Proctor</p>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {result.violationsCount === 0 ? 'Clean' : `${result.violationsCount} Flag`}
          </p>
        </div>
      </div>

      {/* Date & actions */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">{result.date}</span>
        <div className="flex gap-2">
          <Link
            to={`/student/results/${result.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-md transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Scorecard
          </Link>
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-md transition-colors"
            title="Download report (coming soon)"
            disabled
          >
            <Download className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
