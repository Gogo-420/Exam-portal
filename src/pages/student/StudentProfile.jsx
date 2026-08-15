import React, { useState } from 'react';
import {
  Save, CheckCircle2, Lock, Eye, EyeOff, Mail,
  Phone, Building2, BookOpen, GraduationCap, User,
} from 'lucide-react';
import ProfileCard from '../../components/student/ProfileCard';
import { useAuth } from '../../context/AuthContext';

import { updateStudentProfile, changePassword } from '../../services/studentService';

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();

  // Profile form state
  const [form, setForm] = useState({
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    phone:      user?.phone      ?? '+91 98765 43210',
    college:    user?.college    ?? 'National Institute of Technology',
    department: user?.department ?? 'Computer Science & Engineering',
    year:       user?.year       ?? '3rd Year',
  });
  const [profileSaved, setProfileSaved]   = useState(false);
  const [profileError, setProfileError]   = useState('');

  // Password form state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent]     = useState(false);
  const [showNew, setShowNew]             = useState(false);
  const [pwSaved, setPwSaved]             = useState(false);
  const [pwError, setPwError]             = useState('');

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  // ── Profile save ──────────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    if (!form.name.trim()) { setProfileError('Full name is required.'); return; }
    if (!form.email.trim()) { setProfileError('Email is required.'); return; }
    try {
      const updated = await updateStudentProfile(form);
      updateProfile(updated); // sync AuthContext cache
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile. Please try again.');
    }
  };

  // ── Password save ─────────────────────────────────────────────────────────
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwError('');
    if (!pwForm.current) { setPwError('Please enter your current password.'); return; }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    try {
      await changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwSaved(true);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err.message || 'Failed to change password. Please try again.');
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition';

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800">

      {/* Profile card */}
      <ProfileCard user={user} />

      {/* Tab switcher */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'profile',  label: 'Profile Details' },
          { key: 'security', label: 'Change Password' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile Details tab ─────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-5">Personal Information</h3>

          {profileError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {profileError}
            </div>
          )}
          {profileSaved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Profile updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`${inputClass} pl-8`}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`${inputClass} pl-8`}
                    placeholder="your@university.edu"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`${inputClass} pl-8`}
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              {/* College */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  College / University
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={form.college}
                    onChange={(e) => setForm({ ...form, college: e.target.value })}
                    className={`${inputClass} pl-8`}
                    placeholder="College name"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className={`${inputClass} pl-8`}
                    placeholder="e.g. Computer Science & Engineering"
                  />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Year of Study
                </label>
                <div className="relative">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className={`${inputClass} pl-8 appearance-none`}
                  >
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Read-only Roll No */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Roll Number (read-only)
              </label>
              <input
                type="text"
                value={user?.rollNo ?? 'CS2026-089'}
                readOnly
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Security / Change Password tab ──────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
          </div>

          {pwError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {pwError}
            </div>
          )}
          {pwSaved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Password changed successfully!
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4 max-w-sm">
            {/* Current password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPw}
                  onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                  className={`${inputClass} pr-9`}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {/* Strength bar */}
              {pwForm.newPw && (
                <div className="mt-1.5 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        pwForm.newPw.length >= i * 3
                          ? i <= 1 ? 'bg-rose-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className={`${inputClass} ${
                  pwForm.confirm && pwForm.confirm !== pwForm.newPw ? 'border-rose-300 focus:border-rose-400' : ''
                }`}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
              {pwForm.confirm && pwForm.confirm !== pwForm.newPw && (
                <p className="text-[10px] text-rose-500 mt-1">Passwords do not match.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
