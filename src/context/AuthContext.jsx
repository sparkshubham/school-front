import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    const token = localStorage.getItem('edunest_access');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setSchool(data.school);
    } catch {
      localStorage.removeItem('edunest_access');
      localStorage.removeItem('edunest_refresh');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('edunest_access', data.accessToken);
    if (data.refreshToken) localStorage.setItem('edunest_refresh', data.refreshToken);
    setUser(data.user);
    setSchool(data.school);
    return data.user;
  }

  function applySession(data) {
    localStorage.setItem('edunest_access', data.accessToken);
    if (data.refreshToken) localStorage.setItem('edunest_refresh', data.refreshToken);
    setUser(data.user);
    setSchool(data.school);
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('edunest_access');
    localStorage.removeItem('edunest_refresh');
    setUser(null);
    setSchool(null);
  }

  const value = useMemo(
    () => ({ user, school, loading, login, logout, applySession, setSchool }),
    [user, school, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
