/**
 * ProtectedRoute — production version.
 *
 * Guards:
 *   1. Must have an authenticated user in AuthContext (server-verified on mount).
 *   2. Stored JWT must not be expired (client-side expiry check as fast-path).
 *   3. Role must match allowedRole if provided.
 *
 * If any guard fails the user is redirected to the appropriate login page.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isTokenValid } from '../services/api';
import { storage } from '../utils/storage';

export default function ProtectedRoute({ allowedRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Fast-path: if the token is already expired, redirect before the server
  // round-trip confirms it (AuthContext will also clear on 401 but this is instant).
  const token = storage.getToken();
  if (!token || !isTokenValid(token)) {
    const dest = allowedRole ? `/${allowedRole}/login` : '/student/login';
    return <Navigate to={dest} replace />;
  }

  // No authenticated user after session restore — go to login
  if (!user) {
    const dest = allowedRole ? `/${allowedRole}/login` : '/student/login';
    return <Navigate to={dest} replace />;
  }

  // Role mismatch — redirect to their own dashboard
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
}
