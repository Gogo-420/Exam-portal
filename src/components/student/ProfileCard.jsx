import React from 'react';
import { Camera } from 'lucide-react';

/**
 * ProfileCard — avatar + name + role banner used on the profile page header.
 * Props:
 *   user        – student user object
 *   onPhotoChange – () => void (placeholder for future photo-upload)
 */
export default function ProfileCard({ user, onPhotoChange }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* Avatar with overlay */}
      <div className="relative shrink-0">
        <img
          src={
            user?.avatar ??
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
          }
          alt={user?.name ?? 'Student'}
          className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200"
        />
        <button
          onClick={onPhotoChange}
          className="absolute bottom-0 right-0 w-6 h-6 bg-[#374151] hover:bg-[#1F2937] text-white rounded-full flex items-center justify-center shadow transition-colors"
          title="Change photo (coming soon)"
          type="button"
        >
          <Camera className="w-3 h-3" />
        </button>
      </div>

      {/* Info */}
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{user?.name ?? 'Student'}</h2>
        <p className="text-xs font-semibold text-blue-700">{user?.rollNo ?? 'CS2026-089'}</p>
        <p className="text-xs text-slate-500">{user?.department ?? 'Computer Science & Engineering'}</p>
        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Active Student
        </span>
      </div>
    </div>
  );
}
