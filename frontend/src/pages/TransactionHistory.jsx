import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setError(null);
        const res = await apiClient.get('/api/v1/me/transactions');
        setTransactions(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch transaction history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching transaction records..." />;

  return (
    <div className="container">
      <h1>Transaction Audit Trail</h1>
      <p className="subtitle">Comprehensive history of all financial activities associated with your account profile</p>

      <ErrorBanner message={error} />

      {transactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No transaction records found.
        </div>
      ) : (
        <div className="card table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{tx.transactionRef}</td>
                  <td><span className="badge badge-info">{tx.type}</span></td>
                  <td style={{ fontSize: '0.85rem' }}>{tx.fromAccountNumber || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{tx.toAccountNumber || '—'}</td>
                  <td style={{ fontWeight: 700 }}>${parseFloat(tx.amount).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      tx.status === 'SUCCESS' ? 'badge-success' :
                      tx.status === 'FAILED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(tx.createdAt).toLocaleString()}
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
