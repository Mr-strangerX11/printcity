'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, api } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch a CSRF token from the server and store it in a module-level variable
   *  so the api interceptor can attach it to all state-changing requests. */
  const fetchCsrfToken = useCallback(async () => {
    try {
      await api.get('/auth/csrf-token');
      // The server sets the __csrf cookie; the axios interceptor reads it from
      // document.cookie and forwards it as X-CSRF-Token on every mutating request.
    } catch {
      // Non-critical — CSRF check will reject the next mutating request
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchCsrfToken();
  }, [fetchUser, fetchCsrfToken]);

  // login() is called AFTER the backend has already set httpOnly cookies.
  // It refreshes user state and mints a fresh CSRF token.
  const login = async () => {
    setLoading(true);
    await Promise.all([fetchUser(), fetchCsrfToken()]);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — cookies may already be cleared
    }
    setUser(null);
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
