import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
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
  }, []);

  if (loading) return <LoadingSpinner text="Fetching system audit logs..." />;

  return (
    <div className="container">
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
                  <td>{log.id}</td>
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
