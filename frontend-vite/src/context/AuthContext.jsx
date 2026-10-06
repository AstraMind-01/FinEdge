import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, setupApiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentMode, setCurrentMode] = useState('ADMIN'); // 'ADMIN' or 'CUSTOMER'
  const [sessions, setSessions] = useState({
    ADMIN: {
      username: 'admin_demo_user',
      email: 'admin_demo@finedge.io',
      role: 'ADMIN',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      token: null,
      refresh: null,
    },
    CUSTOMER: {
      username: 'customer_demo_user',
      email: 'customer_demo@finedge.io',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      kycStatus: 'VERIFIED',
      token: null,
      refresh: null,
    },
  });

  const [loading, setLoading] = useState(true);

  const activeSession = sessions[currentMode];
  const accessToken = activeSession?.token;
  const refreshToken = activeSession?.refresh;

  const handleSetTokens = useCallback((newAccess, newRefresh) => {
    setSessions((prev) => ({
      ...prev,
      [currentMode]: {
        ...prev[currentMode],
        token: newAccess,
        refresh: newRefresh || prev[currentMode].refresh,
      },
    }));
  }, [currentMode]);

  const logout = useCallback(() => {
    // No-op for direct access mode
  }, []);

  useEffect(() => {
    setupApiClient({
      getAccess: () => accessToken,
      getRefresh: () => refreshToken,
      setTokens: handleSetTokens,
      onLogout: logout,
    });
  }, [accessToken, refreshToken, handleSetTokens, logout]);

  // Helper to authenticate a persona (Register -> Login -> KYC -> Re-Login)
  const initPersona = async (username, email, password, fullName, govIdNumber) => {
    let loginResp;
    try {
      loginResp = await apiClient.post('/api/v1/auth/login', {
        usernameOrEmail: username,
        password,
      });
    } catch {
      await apiClient.post('/api/v1/auth/register', {
        username,
        email,
        password,
      });
      loginResp = await apiClient.post('/api/v1/auth/login', {
        usernameOrEmail: username,
        password,
      });
    }

    const access = loginResp.data.accessToken;

    try {
      await apiClient.post(
        '/api/v1/customers/kyc',
        {
          fullName,
          dateOfBirth: '1990-01-01',
          phoneNumber: '9876543210',
          address: '100 Financial Center',
          governmentIdType: 'PASSPORT',
          governmentIdNumber: govIdNumber,
        },
        { headers: { Authorization: `Bearer ${access}` } }
      );
    } catch {
      // Profile already submitted
    }

    const verifiedLoginResp = await apiClient.post('/api/v1/auth/login', {
      usernameOrEmail: username,
      password,
    });

    return {
      token: verifiedLoginResp.data.accessToken,
      refresh: verifiedLoginResp.data.refreshToken,
    };
  };

  // Auto-authenticate both personas on load
  useEffect(() => {
    let isMounted = true;

    const autoAuthenticateAll = async () => {
      try {
        const adminCreds = await initPersona(
          'admin_demo_user',
          'admin_demo@finedge.io',
          'Password123!',
          'Admin Persona',
          'P99998888'
        );

        const customerCreds = await initPersona(
          'customer_demo_user',
          'customer_demo@finedge.io',
          'Password123!',
          'Customer Persona',
          'C11112222'
        );

        if (isMounted) {
          setSessions({
            ADMIN: {
              username: 'admin_demo_user',
              email: 'admin_demo@finedge.io',
              role: 'ADMIN',
              status: 'ACTIVE',
              kycStatus: 'VERIFIED',
              token: adminCreds.token,
              refresh: adminCreds.refresh,
            },
            CUSTOMER: {
              username: 'customer_demo_user',
              email: 'customer_demo@finedge.io',
              role: 'CUSTOMER',
              status: 'ACTIVE',
              kycStatus: 'VERIFIED',
              token: customerCreds.token,
              refresh: customerCreds.refresh,
            },
          });
        }
      } catch (err) {
        console.warn('Backend auto-auth fallback mode active:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    autoAuthenticateAll();
    return () => {
      isMounted = false;
    };
  }, []);

  const switchMode = (targetMode) => {
    if (targetMode && (targetMode === 'ADMIN' || targetMode === 'CUSTOMER')) {
      setCurrentMode(targetMode);
    } else {
      setCurrentMode((prev) => (prev === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'));
    }
  };

  const value = {
    accessToken,
    refreshToken,
    user: activeSession,
    currentMode,
    role: activeSession?.role || currentMode,
    isAdmin: currentMode === 'ADMIN',
    loading,
    authError: null,
    switchMode,
    toggleRole: () => switchMode(),
    login: async () => activeSession,
    register: async () => activeSession,
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
