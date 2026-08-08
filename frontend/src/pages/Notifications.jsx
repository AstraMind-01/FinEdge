import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setError(null);
        const res = await apiClient.get('/api/v1/notifications');
        setNotifications(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <LoadingSpinner text="Loading notification feed..." />;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1>Event Notifications</h1>
      <p className="subtitle">Real-time alerts published via Kafka event stream</p>

      <ErrorBanner message={error} />

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
