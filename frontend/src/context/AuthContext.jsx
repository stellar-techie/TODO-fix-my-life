import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cozy_journal_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cozy_journal_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check current session on initial load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cozy_journal_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('cozy_journal_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { user: userData, token: userToken } = res.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('cozy_journal_token', userToken);
      localStorage.setItem('cozy_journal_user', JSON.stringify(userData));

      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      const { user: userData, token: userToken } = res.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem('cozy_journal_token', userToken);
      localStorage.setItem('cozy_journal_user', JSON.stringify(userData));

      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cozy_journal_token');
    localStorage.removeItem('cozy_journal_user');
  };

  const updateProfile = async (userData) => {
    try {
      const res = await authAPI.updateProfile(userData);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('cozy_journal_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      return { success: false, message };
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
