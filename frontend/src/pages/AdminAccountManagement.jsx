import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { ErrorBanner } from '../components/ErrorBanner';

export const AdminAccountManagement = () => {
  const [searchId, setSearchId] = useState('');
  const [account, setAccount] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [patching, setPatching] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setAccount(null);

    try {
      const res = await apiClient.get(`/api/v1/accounts/${searchId}`);
      setAccount(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.message || `Account ID ${searchId} not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!account) return;
    setPatching(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await apiClient.patch(`/api/v1/accounts/${account.id}/status`, {
        status: newStatus
      });
      setAccount(res.data);
      setSuccessMsg(`Successfully updated account ${res.data.accountNumber} status to ${res.data.status}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account status.');
    } finally {
      setPatching(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h1>Account Management</h1>
        <span className="badge badge-warning">ADMIN ONLY</span>
      </div>
      <p className="subtitle">Lookup account by ID and modify operational status (ACTIVE / INACTIVE / FROZEN)</p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Account Lookup</h3>
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="number"
            className="form-input"
            placeholder="Enter Account Database ID (e.g. 1)"
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
        <div className="alert alert-success">
          <div><strong>Success: </strong>{successMsg}</div>
        </div>
      )}

      {account && (
        <div className="card">
          <h3>Account Details: {account.accountNumber}</h3>
          
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
