import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';

export const AdminAccountManagement = () => {
  const [allAccounts, setAllAccounts] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [account, setAccount] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [patching, setPatching] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchAllAccounts = async () => {
    try {
      const res = await apiClient.get('/api/v1/accounts/admin/all');
      setAllAccounts(res.data);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.get(`/api/v1/accounts/${searchId}`);
      setAccount(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.message || `Account '${searchId}' not found.`);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (acc) => {
    setAccount(acc);
    setNewStatus(acc.status);
    setSearchId(acc.accountNumber);
    setError(null);
    setSuccessMsg(null);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!account) return;
    setPatching(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.patch(`/api/v1/accounts/${account.id}/status`, {
        status: newStatus,
      });
      setAccount(res.data);
      setSuccessMsg(`Successfully updated account #${res.data.accountNumber} status to ${res.data.status}`);
      await fetchAllAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account status.');
    } finally {
      setPatching(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h1>Account Management</h1>
        <span className="badge badge-warning">ADMIN ONLY</span>
      </div>
      <p className="subtitle">Lookup account by Database ID or 10-Digit Account Number to modify operational status</p>

      {/* Account Lookup Search Box */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Account Lookup</h3>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter Database ID (e.g. 1) or 10-Digit Account Number (e.g. 1051660567)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Lookup'}
          </button>
        </form>
      </div>

      <ErrorBanner message={error} />

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <div><strong>Success: </strong>{successMsg}</div>
        </div>
      )}

      {/* Active Accounts Table List */}
      {allAccounts.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>All Bank Accounts ({allAccounts.length})</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Click any account row to select it for status modification:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>ID</th>
                  <th style={{ padding: '0.5rem' }}>Account Number</th>
                  <th style={{ padding: '0.5rem' }}>Owner</th>
                  <th style={{ padding: '0.5rem' }}>Type</th>
                  <th style={{ padding: '0.5rem' }}>Balance</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                  <th style={{ padding: '0.5rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      background: account?.id === acc.id ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>#{acc.id}</td>
                    <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace' }}>{acc.accountNumber}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{acc.ownerUsername}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>{acc.accountType}</td>
                    <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>${parseFloat(acc.balance).toFixed(2)}</td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {acc.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectAccount(acc); }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {account && (
        <div className="card animate-scale-up">
          <h3>Account Details: #{account.accountNumber} (DB ID: {account.id})</h3>

          <div className="grid grid-2" style={{ margin: '1.5rem 0' }}>
            <div>
              <span className="form-label">ACCOUNT OWNER</span>
              <p style={{ fontWeight: 600 }}>{account.ownerUsername}</p>
            </div>
            <div>
              <span className="form-label">TYPE</span>
              <p style={{ fontWeight: 600 }}>{account.accountType}</p>
            </div>
            <div>
              <span className="form-label">CURRENT BALANCE</span>
              <p style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                ${parseFloat(account.balance).toFixed(2)}
              </p>
            </div>
            <div>
              <span className="form-label">CURRENT STATUS</span>
              <div>
                <span className={`badge ${account.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                  {account.status}
                </span>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

          <h3>Update Account Status</h3>
          <form onSubmit={handleStatusUpdate} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">New Status Selection</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE (Normal operational state)</option>
                <option value="INACTIVE">INACTIVE (Restricted access)</option>
                <option value="FROZEN">FROZEN (Blocked by Risk/Compliance)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={patching || newStatus === account.status}>
              {patching ? 'Updating Status...' : 'Apply Status Change'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
