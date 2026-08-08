import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, setupApiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const logout = useCallback(() => {
    if (refreshToken) {
      apiClient.post('/api/v1/auth/logout', { refreshToken }).catch(() => {});
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setAuthError(null);
  }, [refreshToken]);

  const handleSetTokens = useCallback((newAccess, newRefresh) => {
    setAccessToken(newAccess);
    if (newRefresh) {
      setRefreshToken(newRefresh);
    }
  }, []);

  useEffect(() => {
    setupApiClient({
      getAccess: () => accessToken,
      getRefresh: () => refreshToken,
      setTokens: handleSetTokens,
      onLogout: logout,
    });
  }, [accessToken, refreshToken, handleSetTokens, logout]);

  const fetchCurrentUser = useCallback(async (token) => {
    try {
      const response = await apiClient.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      throw err;
    }
  }, []);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const response = await apiClient.post('/api/v1/auth/login', { username, password });
      const { accessToken: access, refreshToken: refresh } = response.data;
      setAccessToken(access);
      setRefreshToken(refresh);
      const userProfile = await fetchCurrentUser(access);
      return userProfile;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Invalid credentials or service unavailable.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const register = async (username, email, password) => {
    setAuthError(null);
    try {
      const response = await apiClient.post('/api/v1/auth/register', { username, email, password });
      const { accessToken: access, refreshToken: refresh } = response.data;
      setAccessToken(access);
      setRefreshToken(refresh);
      const userProfile = await fetchCurrentUser(access);
      return userProfile;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Username/email may already exist.';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    // Initial loading complete
    setLoading(false);
  }, []);

  const value = {
    accessToken,
    refreshToken,
    user,
    role: user?.role || null,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    loading,
    authError,
    login,
    register,
    logout,
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
