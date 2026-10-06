import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAdmin, switchMode } = useAuth();

  if (adminOnly && !isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h2>Admin Privilege Required</h2>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
            This portal is restricted to Administrator users. Switch to Admin Mode to view system audit logs, manage accounts, and monitor AI fraud detections.
          </p>
          <button
            onClick={() => switchMode('ADMIN')}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Switch to Admin Mode Now
          </button>
        </div>
      </div>
    );
  }

  return children;
};
