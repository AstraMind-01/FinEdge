import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const Notifications = () => {
  const { user, currentMode } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/api/v1/notifications');
      setNotifications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user notifications. Click Retry to reload.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [user, currentMode, fetchNotifications]);

  if (loading) return <LoadingSpinner text="Loading notification feed..." />;

  return (
    <div className="container animate-slide-up" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1>Event Notifications</h1>
        <button onClick={fetchNotifications} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
          🔄 Refresh
        </button>
      </div>
      <p className="subtitle">Real-time alerts published via Kafka event stream</p>

      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorBanner message={error} />
          <button onClick={fetchNotifications} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Retry Loading Notifications
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No notifications recorded yet. Make a deposit, withdrawal, or transfer to receive Kafka event alerts.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n) => (
            <div key={n.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span className={`badge ${
                n.type === 'ALERT' || n.type === 'FRAUD_WARNING' ? 'badge-danger' : 'badge-info'
              }`}>
                {n.type || 'NOTIFICATION'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{n.message}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {n.transactionRef && <span>Ref: {n.transactionRef}</span>}
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
