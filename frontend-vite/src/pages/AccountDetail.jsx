import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const AccountDetail = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // Fetch account details & balance
        const [accRes, balRes, txRes] = await Promise.all([
          apiClient.get(`/api/v1/accounts/${id}`),
          apiClient.get(`/api/v1/accounts/${id}/balance`),
          apiClient.get('/api/v1/me/transactions')
        ]);
        setAccount(accRes.data);
        setBalance(balRes.data);

        // Filter transactions for this specific account
        const accNum = accRes.data.accountNumber;
        const relevant = txRes.data.filter(
          (t) => t.fromAccountNumber === accNum || t.toAccountNumber === accNum
        );
        setTransactions(relevant);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch account details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner text="Fetching account details..." />;

  return (
    <div className="container">
      <Link to="/dashboard" className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        ← Back to Dashboard
      </Link>

      <ErrorBanner message={error} />

      {account && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge badge-info">{account.accountType}</span>
              <h1 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>{account.accountNumber}</h1>
              <p className="subtitle" style={{ marginBottom: 0 }}>Created on {new Date(account.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`badge ${account.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
              {account.status}
            </span>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <span className="form-label">REAL-TIME BALANCE</span>
            <h2 style={{ fontSize: '2.25rem', color: '#fff', margin: 0 }}>
              ${parseFloat(balance?.balance || account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      )}

      <h2>Account Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No transactions recorded for this account yet.
        </div>
      ) : (
        <div className="card table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>From / To</th>
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
                  <td style={{ fontSize: '0.85rem' }}>
                    {tx.fromAccountNumber && <div>From: {tx.fromAccountNumber}</div>}
                    {tx.toAccountNumber && <div>To: {tx.toAccountNumber}</div>}
                  </td>
                  <td style={{ fontWeight: 700, color: tx.fromAccountNumber === account?.accountNumber ? '#f87171' : '#34d399' }}>
                    {tx.fromAccountNumber === account?.accountNumber ? '-' : '+'}${parseFloat(tx.amount).toFixed(2)}
                  </td>
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
