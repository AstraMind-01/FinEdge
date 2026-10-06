import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const Transactions = () => {
  const [activeTab, setActiveTab] = useState('deposit'); // deposit | withdraw | transfer
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [fromAccountNumber, setFromAccountNumber] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [customToAccount, setCustomToAccount] = useState('');
  const [isCustomDestination, setIsCustomDestination] = useState(false);
  const [amount, setAmount] = useState('');

  const fetchAccounts = async () => {
    try {
      let res = await apiClient.get('/api/v1/accounts');
      let accList = res.data;

      // Removed auto-provisioning of demo accounts.

      setAccounts(accList);
      if (accList.length > 0) {
        setFromAccountNumber(accList[0].accountNumber);
        const secondAcc = accList.length > 1 ? accList[1].accountNumber : accList[0].accountNumber;
        setToAccountNumber(secondAcc);
      }
    } catch (err) {
      setErrorInfo({
        title: 'Error',
        message: 'Failed to load user accounts for transaction selection.',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorInfo(null);
    setSuccessMsg(null);
    setIsCustomDestination(false);

    if (tab === 'deposit') {
      setToAccountNumber(accounts[0]?.accountNumber || '');
    } else if (tab === 'withdraw') {
      setFromAccountNumber(accounts[0]?.accountNumber || '');
    } else if (tab === 'transfer') {
      const src = accounts[0]?.accountNumber || '';
      const other = accounts.find((a) => a.accountNumber !== src);
      if (other) {
        setFromAccountNumber(src);
        setToAccountNumber(other.accountNumber);
        setIsCustomDestination(false);
      } else {
        setFromAccountNumber(src);
        setIsCustomDestination(true);
      }
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorInfo(null);
    setSuccessMsg(null);

    const idempotencyKey = crypto.randomUUID();
    const parsedAmount = parseFloat(amount);

    const firstAccNum = accounts[0]?.accountNumber;
    const destTarget = isCustomDestination ? customToAccount : toAccountNumber;

    try {
      let endpoint = '';
      let payload = { amount: parsedAmount, idempotencyKey };

      if (activeTab === 'deposit') {
        endpoint = '/api/v1/transactions/deposit';
        payload.toAccountNumber = toAccountNumber || firstAccNum;
      } else if (activeTab === 'withdraw') {
        endpoint = '/api/v1/transactions/withdraw';
        payload.fromAccountNumber = fromAccountNumber || firstAccNum;
      } else if (activeTab === 'transfer') {
        endpoint = '/api/v1/transactions/transfer';
        payload.fromAccountNumber = fromAccountNumber || firstAccNum;
        payload.toAccountNumber = destTarget;
      }

      const res = await apiClient.post(endpoint, payload);
      setSuccessMsg(`Transaction successful! Reference: ${res.data.transactionRef}`);
      setAmount('');
      if (isCustomDestination) setCustomToAccount('');
      // Refresh accounts balance after transaction
      await fetchAccounts();
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const backendMsg = data?.message || err.message;

      if (status === 403) {
        setErrorInfo({
          title: 'LIMIT_OR_FRAUD_REJECTED (HTTP 403)',
          message: backendMsg,
          type: 'danger',
        });
      } else if (status === 409) {
        setErrorInfo({
          title: 'IDEMPOTENCY_CONFLICT (HTTP 409)',
          message: `Idempotency key reuse detected with mismatching payload. ${backendMsg}`,
          type: 'warning',
        });
      } else if (status === 503) {
        setErrorInfo({
          title: 'FRAUD_SERVICE_UNAVAILABLE (HTTP 503)',
          message: `Fail-closed security policy triggered: Fraud detection engine is unreachable. ${backendMsg}`,
          type: 'danger',
        });
      } else {
        setErrorInfo({
          title: `Transaction Error (HTTP ${status || 'Client'})`,
          message: backendMsg,
          type: 'danger',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching your accounts..." />;

  const otherAccountsForTransfer = accounts.filter((acc) => acc.accountNumber !== fromAccountNumber);

  return (
    <div className="container animate-slide-up">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1>Financial Operations</h1>
        <p className="subtitle">Execute deposits, withdrawals, and peer-to-peer transfers</p>

        {/* Operation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['deposit', 'withdraw', 'transfer'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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
          <div
            className="alert alert-success animate-scale-up"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-success)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                marginBottom: '0.5rem',
              }}
            >
              ✓
            </div>
            <h3 style={{ color: 'var(--accent-success)', marginBottom: '0.2rem' }}>Transaction Successful</h3>
            <span style={{ fontSize: '0.9rem' }}>{successMsg}</span>
          </div>
        )}

        <div className="card animate-slide-up stagger-1">
          <h3 style={{ textTransform: 'capitalize', marginBottom: '1.5rem' }}>{activeTab} Funds</h3>

          <form onSubmit={handleTransaction}>
            {/* From Account Selection */}
            {(activeTab === 'withdraw' || activeTab === 'transfer') && (
              <div className="form-group">
                <label className="form-label">Source Account (From)</label>
                <select
                  className="form-select"
                  value={fromAccountNumber}
                  onChange={(e) => {
                    setFromAccountNumber(e.target.value);
                    if (toAccountNumber === e.target.value) {
                      const other = accounts.find((a) => a.accountNumber !== e.target.value);
                      if (other) {
                        setToAccountNumber(other.accountNumber);
                        setIsCustomDestination(false);
                      } else {
                        setIsCustomDestination(true);
                      }
                    }
                  }}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      #{acc.accountNumber} ({acc.accountType} — Balance: ${parseFloat(acc.balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Destination Account Selection for Deposit */}
            {activeTab === 'deposit' && (
              <div className="form-group">
                <label className="form-label">Destination Account (To)</label>
                <select
                  className="form-select"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.accountNumber}>
                      #{acc.accountNumber} ({acc.accountType} — Balance: ${parseFloat(acc.balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Destination Account Selection for Transfer */}
            {activeTab === 'transfer' && (
              <div className="form-group">
                <label className="form-label">Destination Account (To)</label>

                {otherAccountsForTransfer.length > 0 && !isCustomDestination ? (
                  <>
                    <select
                      className="form-select"
                      value={toAccountNumber}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM_INPUT') {
                          setIsCustomDestination(true);
                        } else {
                          setToAccountNumber(e.target.value);
                        }
                      }}
                      required
                    >
                      {otherAccountsForTransfer.map((acc) => (
                        <option key={acc.id} value={acc.accountNumber}>
                          #{acc.accountNumber} ({acc.accountType} — Balance: ${parseFloat(acc.balance).toFixed(2)})
                        </option>
                      ))}
                      <option value="CUSTOM_INPUT">✏️ Enter External / Peer Account Number...</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 10-digit Destination Account Number"
                      value={customToAccount}
                      onChange={(e) => setCustomToAccount(e.target.value)}
                      required
                    />
                    {otherAccountsForTransfer.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCustomDestination(false)}
                        className="btn btn-secondary"
                        style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                      >
                        ← Choose from my accounts
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Amount Input */}
            <div className="form-group">
              <label className="form-label">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="100.00"
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
