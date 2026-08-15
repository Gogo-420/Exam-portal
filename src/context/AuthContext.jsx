/**
 * AuthContext — production version.
 *
 * • login / register call the real backend via authService.
 * • On mount the stored token is validated (expiry check) and the user profile
 *   is re-fetched from /auth/me to ensure it is current.
 * • No demo users, no auto-login, no switchRoleDemo.
 * • Errors from the API are re-thrown so forms can surface them to users.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, isTokenValid } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Boot: restore session from localStorage if token is still valid ───────
  useEffect(() => {
    const restoreSession = async () => {
      const token = storage.getToken();

      if (!token || !isTokenValid(token)) {
        // Token absent or expired — clear any stale data and show login
        storage.clearSession();
        setLoading(false);
        return;
      }

      // Token looks valid — try to fetch fresh profile from server
      try {
        const freshUser = await authService.getCurrentUser();
        setUser(freshUser);
        storage.setUser(freshUser);
      } catch {
        // Server rejected the token (revoked / rotated secret / etc.)
        storage.clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  /**
   * Throws a normalised Error if the server returns 4xx/5xx.
   * On success stores the JWT and user profile, then returns the user object.
   */
  const login = useCallback(async (emailOrUsername, password, role) => {
    const data = await authService.login({ email: emailOrUsername, username: emailOrUsername, password }, role);
    // Backend must return { token, user }
    storage.setToken(data.token);
    storage.setUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  /**
   * Throws a normalised Error if the server returns 4xx/5xx.
   * On success stores the JWT and user profile, then returns the user object.
   */
  const register = useCallback(async (formData, role) => {
    const data = await authService.register(formData, role);
    storage.setToken(data.token);
    storage.setUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* best-effort */ }
    storage.clearSession();
    setUser(null);
  }, []);

  // ── Update profile (optimistic — called after a successful PUT /profile) ─
  const updateProfile = useCallback((updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedFields };
      storage.setUser(updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role:    user?.role ?? null,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
