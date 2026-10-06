import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const AdminAuditLogs = () => {
  const { isAdmin, switchMode, currentMode } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get('/api/v1/audit-logs');
        setLogs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch platform audit logs. ADMIN privileges required.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [isAdmin, currentMode]);

  if (!isAdmin) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
          <h2>Admin Privilege Required</h2>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
            Viewing centralized platform compliance & security audit logs requires Administrator privileges.
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

  if (loading) return <LoadingSpinner text="Fetching system audit logs..." />;

  return (
    <div className="container animate-slide-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h1>Platform Audit Logs</h1>
        <span className="badge badge-warning">ADMIN ONLY</span>
      </div>
      <p className="subtitle">Centralized compliance & security event trail consumed from Kafka `transaction-events` topic</p>

      <ErrorBanner message={error} />

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="card table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Transaction Ref</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>#{log.id}</td>
                  <td><span className="badge badge-info">{log.action}</span></td>
                  <td style={{ fontWeight: 600 }}>{log.performedByUsername}</td>
                  <td style={{ fontFamily: 'monospace' }}>{log.transactionRef || 'N/A'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{log.details}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
