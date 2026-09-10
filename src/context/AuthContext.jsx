import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import {
  decodeAccessToken,
  persistSchool,
  readCachedSchool,
  schoolFromPayload,
  userFromPayload,
} from '../utils/session.js';

const AuthContext = createContext(null);

function bootSession() {
  const token = localStorage.getItem('edunest_access');
  const payload = decodeAccessToken(token);
  if (!payload) {
    if (token) {
      localStorage.removeItem('edunest_access');
      localStorage.removeItem('edunest_refresh');
    }
    return { user: null, school: null, blocked: false };
  }
  return {
    user: userFromPayload(payload),
    school: schoolFromPayload(payload, readCachedSchool()),
    blocked: false,
  };
}

export function AuthProvider({ children }) {
  const [boot] = useState(bootSession);
  const [user, setUser] = useState(boot.user);
  const [school, setSchool] = useState(boot.school);
  const [loading, setLoading] = useState(boot.blocked);

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
      persistSchool(data.school);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('edunest_access');
        localStorage.removeItem('edunest_refresh');
        persistSchool(null);
        setUser(null);
        setSchool(null);
      }
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
    persistSchool(data.school);
    setUser(data.user);
    setSchool(data.school);
    return data.user;
  }

  function applySession(data) {
    localStorage.setItem('edunest_access', data.accessToken);
    if (data.refreshToken) localStorage.setItem('edunest_refresh', data.refreshToken);
    persistSchool(data.school);
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
    persistSchool(null);
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
