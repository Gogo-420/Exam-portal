import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm({ initialRole = 'student' }) {
  const [activeTab,   setActiveTab]   = useState(initialRole);
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password,    setPassword]    = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  // ── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!emailOrUser.trim()) return 'Please enter your username or email.';
    if (activeTab !== 'admin' && !EMAIL_RE.test(emailOrUser.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!password) return 'Please enter your password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await login(emailOrUser.trim(), password, activeTab);
      navigate(`/${activeTab}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEmailOrUser('');
    setPassword('');
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 sm:p-8 max-w-md w-full mx-auto text-slate-800">

      {/* Role tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg mb-6 text-xs font-medium">
        {['student', 'interviewer', 'admin'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`py-2 rounded-md transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {activeTab === 'student'     && 'Student Exam Portal Login'}
          {activeTab === 'interviewer' && 'Interviewer Workstation Login'}
          {activeTab === 'admin'       && 'University Admin Login'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sign in to access your secure AI exam environment
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
        {/* Email / Username */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {activeTab === 'admin' ? 'Username or Email' : 'University Email'}
          </label>
          <div className="relative">
            {activeTab === 'admin'
              ? <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              : <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            }
            <input
              type={activeTab === 'admin' ? 'text' : 'email'}
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              placeholder={activeTab === 'admin' ? 'admin' : `you@university.edu`}
              autoComplete={activeTab === 'admin' ? 'username' : 'email'}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
        >
          <span>
            {loading
              ? 'Signing in…'
              : `Sign in as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          </span>
          {!loading && <ArrowRight className="w-4 h-4 text-blue-400" />}
        </button>
      </form>

      {activeTab !== 'admin' && (
        <p className="text-center text-xs text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to={`/${activeTab}/register`} className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      )}
    </div>
  );
}
