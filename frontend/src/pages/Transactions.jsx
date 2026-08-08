import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const Transactions = () => {
  const [activeTab, setActiveTab] = useState('deposit'); // deposit | withdraw | transfer
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null); // { title, message, type }
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [fromAccountNumber, setFromAccountNumber] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await apiClient.get('/api/v1/accounts');
        setAccounts(res.data);
        if (res.data.length > 0) {
          setFromAccountNumber(res.data[0].accountNumber);
        }
      } catch (err) {
        setErrorInfo({
          title: 'Error',
          message: 'Failed to load user accounts for transaction selection.',
          type: 'danger'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorInfo(null);
    setSuccessMsg(null);

    const idempotencyKey = crypto.randomUUID();
    const parsedAmount = parseFloat(amount);

    try {
      let endpoint = '';
      let payload = { amount: parsedAmount, idempotencyKey };

      if (activeTab === 'deposit') {
        endpoint = '/api/v1/transactions/deposit';
        payload.toAccountNumber = toAccountNumber || accounts[0]?.accountNumber;
      } else if (activeTab === 'withdraw') {
        endpoint = '/api/v1/transactions/withdraw';
        payload.fromAccountNumber = fromAccountNumber;
      } else if (activeTab === 'transfer') {
        endpoint = '/api/v1/transactions/transfer';
        payload.fromAccountNumber = fromAccountNumber;
        payload.toAccountNumber = toAccountNumber;
      }

      const res = await apiClient.post(endpoint, payload);
      setSuccessMsg(`Transaction successful! Reference: ${res.data.transactionRef}`);
      setAmount('');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const backendMsg = data?.message || err.message;

      if (status === 403) {
        setErrorInfo({
          title: 'FRAUD_RISK_BLOCKED (HTTP 403)',
          message: `Transaction was blocked by FinEdge Fraud Detection ML Engine. ${backendMsg}`,
          type: 'danger'
        });
      } else if (status === 409) {
        setErrorInfo({
          title: 'IDEMPOTENCY_CONFLICT (HTTP 409)',
          message: `Idempotency key reuse detected with mismatching payload. ${backendMsg}`,
          type: 'warning'
        });
      } else if (status === 503) {
        setErrorInfo({
          title: 'FRAUD_SERVICE_UNAVAILABLE (HTTP 503)',
          message: `Fail-closed security policy triggered: Fraud detection engine is unreachable. ${backendMsg}`,
          type: 'danger'
        });
      } else {
        setErrorInfo({
          title: `Transaction Error (HTTP ${status || 'Client'})`,
          message: backendMsg,
          type: 'danger'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading accounts..." />;

  return (
    <div className="container animate-slide-up">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1>Financial Operations</h1>
        <p className="subtitle">Execute secure deposits, withdrawals, and peer transfers</p>

        {/* Operation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['deposit', 'withdraw', 'transfer'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setErrorInfo(null); setSuccessMsg(null); }}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {errorInfo && (
          <ErrorBanner message={errorInfo.message} title={errorInfo.title} type={errorInfo.type} />
        )}

        {successMsg && (
          <div className="alert alert-success animate-scale-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              background: 'var(--accent-success)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(22, 122, 82, 0.2)'
            }}>✓</div>
            <h3 style={{ color: 'var(--accent-success)', marginBottom: '0.5rem' }}>Transaction Successful</h3>
            <span style={{ fontSize: '0.95rem' }}>{successMsg}</span>
          </div>
        )}

        <div className="card animate-slide-up stagger-1">
          <h3 style={{ textTransform: 'capitalize', marginBottom: '1.5rem' }}>{activeTab} Funds</h3>

          <form onSubmit={handleTransaction}>
            {/* From Account selection (Withdraw / Transfer) */}
            {(activeTab === 'withdraw' || activeTab === 'transfer') && (
              <div className="form-group">
                <label className="form-label">Source Account (From)</label>
                <select
                  className="form-select"
                  value={fromAccountNumber}
                  onChange={(e) => setFromAccountNumber(e.target.value)}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} ({acc.accountType} - ${parseFloat(acc.balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* To Account selection (Deposit / Transfer) */}
            {activeTab === 'deposit' && (
              <div className="form-group">
                <label className="form-label">Destination Account (To)</label>
                <select
                  className="form-select"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      {acc.accountNumber} ({acc.accountType} - ${parseFloat(acc.balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'transfer' && (
              <div className="form-group">
                <label className="form-label">Destination Account Number (To)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ACC-1002"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={submitting || accounts.length === 0}
            >
              {submitting ? 'Processing Transaction...' : `Execute ${activeTab.toUpperCase()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
