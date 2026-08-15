import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, BookOpen, ShieldCheck, ArrowRight, Hash } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * ExamCard — card for a single upcoming exam entry.
 * Props:
 *   exam – upcoming exam object from MOCK_UPCOMING_INTERVIEWS
 */
export default function ExamCard({ exam }) {
  const isReady = exam.status === 'Ready';

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Hash className="w-3 h-3" />
            <span>{exam.code ?? 'EXAM-CODE'}</span>
          </span>
          <Badge variant={isReady ? 'emerald' : 'amber'}>{exam.status}</Badge>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {exam.company ?? exam.title ?? 'Technical Assessment'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{exam.domain}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700">
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Date</span>
            <span className="font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />{exam.date}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Time</span>
            <span className="font-semibold">{exam.time}</span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Duration</span>
            <span className="font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />{exam.duration}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Questions</span>
            <span className="font-semibold flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              {exam.questions ? exam.questions.length : exam.totalQuestions ?? 10} MCQs
            </span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-[11px] text-slate-600 leading-relaxed bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-start gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <span>{exam.instructions ?? 'Ensure camera and microphone are connected. Fullscreen lock active.'}</span>
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-2">
        <Link
          to={`/student/ready/${exam.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#374151] hover:bg-[#1F2937] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          <span>{isReady ? 'Start Exam' : 'View Details'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
