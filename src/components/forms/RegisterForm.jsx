import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, BookOpen, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE  = /^[a-zA-Z\s.'-]{2,80}$/;

const DOMAINS = [
  'Data Structures & Algorithms',
  'Artificial Intelligence & ML',
  'Database Management Systems',
  'Network Security & Cryptography',
  'Full Stack Web Development',
];

export default function RegisterForm({ role = 'student' }) {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [domain,          setDomain]          = useState(DOMAINS[0]);
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  const { register } = useAuth();
  const navigate     = useNavigate();

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim())            return 'Full name is required.';
    if (!NAME_RE.test(name.trim())) return 'Name must be 2–80 letters and contain only letters, spaces, hyphens, or apostrophes.';
    if (!email.trim())           return 'Email address is required.';
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (!password)               return 'Password is required.';
    if (password.length < 8)    return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must include at least one number.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  // Password strength (0–4)
  const strength = (() => {
    let s = 0;
    if (password.length >= 8)   s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-emerald-500'][strength];

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, domain }, role);
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition';

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 sm:p-8 max-w-md w-full mx-auto text-slate-800">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {role === 'student' ? 'Register Student Account' : 'Register Interviewer Account'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Create credentials to access the university examination network
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              autoComplete="name"
              className={inputClass}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">University Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              autoComplete="email"
              className={inputClass}
            />
          </div>
        </div>

        {/* Domain — interviewer only */}
        {role === 'interviewer' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assigned Domain / Subject Area
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:border-blue-400 transition appearance-none"
              >
                {DOMAINS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              className={`${inputClass} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {/* Strength bar */}
          {password && (
            <div className="mt-1.5 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                Strength: <span className="font-semibold text-slate-600">{strengthLabel}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`${inputClass} ${
                confirmPassword && confirmPassword !== password
                  ? 'border-red-300 focus:border-red-400'
                  : ''
              }`}
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-[10px] text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
        >
          <span>{loading ? 'Creating account…' : 'Complete Registration'}</span>
          {!loading && <ArrowRight className="w-4 h-4 text-blue-400" />}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        Already have an account?{' '}
        <Link to={`/${role}/login`} className="text-blue-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
