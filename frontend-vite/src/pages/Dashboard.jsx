import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { useCountUp } from '../hooks/useCountUp';

export const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create Account Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accountType, setAccountType] = useState('SAVINGS');
  const [initialDeposit, setInitialDeposit] = useState('100.00');
  const [creating, setCreating] = useState(false);

  const fetchAccounts = async () => {
    try {
      setError(null);
      const res = await apiClient.get('/api/v1/accounts');
      setAccounts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await apiClient.post('/api/v1/accounts', {
        accountType,
        initialDeposit: parseFloat(initialDeposit)
      });
      setShowCreateModal(false);
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setCreating(false);
    }
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + (parseFloat(curr.balance) || 0), 0);
  const animatedBalance = useCountUp(totalBalance, 800);

  if (loading) return <LoadingSpinner text="Fetching your accounts..." />;

  return (
    <div className="container animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Welcome, {user?.username}</h1>
          <div className="gold-accent-line"></div>
          <p className="subtitle" style={{ marginBottom: 0 }}>Overview of your accounts and assets</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          + Open New Account
        </button>
      </div>

      <ErrorBanner message={error} />

      {/* Net Balance Overview Card */}
      <div className="card animate-slide-up stagger-1" style={{ marginBottom: '2rem', background: 'var(--color-primary)', border: '1px solid var(--color-accent)' }}>
        <span className="form-label" style={{ color: 'var(--color-accent-light)' }}>NET PORTFOLIO VALUE</span>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-inverse)', margin: '0.2rem 0' }}>
          ${animatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>across {accounts.length} active account(s)</p>
      </div>

      <h2>Your Bank Accounts</h2>

      {accounts.length === 0 ? (
        <div className="card animate-slide-up stagger-2" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You don't have any open accounts yet.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            Open Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-2">
          {accounts.map((acc, idx) => (
            <div key={acc.id} className={`card animate-slide-up stagger-${Math.min(idx + 2, 6)}`} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="badge badge-info">{acc.accountType}</span>
                  <h3 style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>{acc.accountNumber}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner: {acc.ownerUsername}</span>
                </div>
                <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                  {acc.status}
                </span>
              </div>

              <div style={{ margin: '1.5rem 0' }}>
                <span className="form-label">AVAILABLE BALANCE</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  ${parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Link to={`/accounts/${acc.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
                  View Details
                </Link>
                <Link to="/transactions" className="btn btn-primary" style={{ flex: 1 }}>
                  Transfer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Account */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 26, 43, 0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '450px', width: '90%' }}>
            <h3>Open New Bank Account</h3>
            <p className="subtitle">Select account type and opening deposit</p>

            <form onSubmit={handleCreateAccount}>
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CHECKING">Checking Account</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Deposit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
