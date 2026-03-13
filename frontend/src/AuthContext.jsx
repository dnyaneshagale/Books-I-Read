/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from './authApi';
import axiosClient from './api/axiosClient';

const AuthContext = createContext(null);

const getTokenExpiry = (jwt) => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const getStoredSession = () => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!storedToken || !storedUser) {
    return { token: null, user: null };
  }

  const expiry = getTokenExpiry(storedToken);
  if (expiry && Date.now() >= expiry) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
};

/**
 * AuthProvider - Manages user authentication state
 * 
 * Provides:
 * - User state
 * - Login/logout/register functions
 * - Token management
 * - Axios interceptor for Authorization header
 */
export const AuthProvider = ({ children }) => {
  const initialSession = getStoredSession();
  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [loading] = useState(false);
  const navigate = useNavigate();

  // Force session-expired redirect
  const forceExpiredLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.error('Session expired. Please log in again.');
    navigate('/login', { replace: true });
  }, [navigate]);

  // Load user from localStorage on mount
  useEffect(() => {
    // Listen for logout events from axios interceptor (expired token)
    const handleLogout = (e) => {
      setToken(null);
      setUser(null);
      if (e.detail?.expired) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  // Proactive token expiry timer + visibility check
  useEffect(() => {
    if (!token) return;

    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    // Set a timeout to auto-logout when token expires
    const msUntilExpiry = expiry - Date.now();
    if (msUntilExpiry <= 0) {
      setTimeout(forceExpiredLogout, 0);
      return;
    }

    const timerId = setTimeout(forceExpiredLogout, msUntilExpiry);

    // Also check when the user returns to the tab (e.g. after phone sleep)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && Date.now() >= expiry) {
        forceExpiredLogout();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [forceExpiredLogout, token]);

  // Add token to axios requests
  useEffect(() => {
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  /**
   * Register new user
   */
  const register = async (username, email, password, displayName) => {
    try {
      const payload = { username, email, password };
      if (displayName && displayName.trim()) {
        payload.displayName = displayName.trim();
      }
      const response = await authApi.register(payload);
      const { token: newToken, ...userData } = response.data;

      // Save to state
      setToken(newToken);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  /**
   * Login user
   */
  const login = async (username, password) => {
    try {
      const response = await authApi.login({ username, password });
      const { token: newToken, ...userData } = response.data;

      // Save to state
      setToken(newToken);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    setUser,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook - Access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
