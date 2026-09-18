import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('zzm_user');
    const token = localStorage.getItem('zzm_token');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.email?.toLowerCase() === 'customer@zamzammart.com' || parsed?.name === 'Amina Rahman' || (parsed?.email?.toLowerCase()?.endsWith('@zamzammart.com') && parsed?.role !== 'ROLE_ADMIN')) {
          localStorage.removeItem('zzm_user');
          localStorage.removeItem('zzm_token');
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch (e) {
        localStorage.removeItem('zzm_user');
        localStorage.removeItem('zzm_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('zzm_user', JSON.stringify(res.data));
      localStorage.setItem('zzm_token', res.data.token);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('zzm_user', JSON.stringify(res.data));
      localStorage.setItem('zzm_token', res.data.token);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const loginWithGoogle = async (email, name) => {
    const res = await api.loginWithGoogle(email, name);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('zzm_user', JSON.stringify(res.data));
      localStorage.setItem('zzm_token', res.data.token);
      return res.data;
    }
    throw new Error(res.message || 'Gmail login failed');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zzm_user');
    localStorage.removeItem('zzm_token');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

