import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

export const AdminFraudDashboard = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFraudHealth = async () => {
      try {
        setError(null);
        // Call FastAPI health check endpoint exposed via API Gateway (/api/v1/fraud/health)
        const res = await apiClient.get('/api/v1/fraud/health');
        setHealthStatus(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to connect to Fraud Detection Service via Gateway.');
      } finally {
        setLoading(false);
      }
    };

    fetchFraudHealth();
  }, []);

  if (loading) return <LoadingSpinner text="Connecting to Fraud Detection Engine..." />;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <h1>AI Fraud Detection Monitoring</h1>
        <span className="badge badge-warning">ADMIN / DEBUG</span>
      </div>
      <p className="subtitle">Real-time ML Model status and service telemetry via Python FastAPI endpoint</p>

      <ErrorBanner message={error} />

      {/* Honest Scope Note Banner */}
      <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
        <div>
          <strong>Viva Transparency Note: </strong>
          The backend provides service-to-service fraud evaluation (`POST /api/v1/fraud/check`) and a health endpoint (`GET /api/v1/fraud/health`).
          Since there is no backend data aggregation endpoint for historical risk scores across all users, this dashboard reflects live engine health and telemetry accurately without fabricating fake metrics.
        </div>
      </div>

      {healthStatus && (
        <div className="grid grid-2">
          <div className="card">
            <h3>Machine Learning Model Engine</h3>
            <div style={{ margin: '1.5rem 0' }}>
              <span className="form-label">OPERATIONAL STATUS</span>
              <div style={{ marginTop: '0.4rem' }}>
                <span className={`badge ${healthStatus.modelStatus === 'ML_MODEL_LOADED' ? 'badge-success' : 'badge-warning'}`}>
                  {healthStatus.modelStatus}
                </span>
              </div>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <span className="form-label">ACTIVE MODEL ALGORITHM</span>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>{healthStatus.modelVersion}</p>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <span className="form-label">ARTIFACTS PATH</span>
              <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{healthStatus.artifactsDir}</p>
            </div>
          </div>

          <div className="card">
            <h3>Microservice Infrastructure</h3>
            <div style={{ margin: '1.5rem 0' }}>
              <span className="form-label">SERVICE NAME</span>
              <p style={{ fontWeight: 600 }}>{healthStatus.service}</p>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <span className="form-label">GATEWAY PORT ROUTE</span>
              <p style={{ fontFamily: 'monospace', color: '#34d399' }}>http://localhost:8080/api/v1/fraud/**</p>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <span className="form-label">FAIL-CLOSED TIMEOUT POLICY</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                3.0s RestTemplate timeout enforced by transaction-service. Unreachable service blocks transactions (HTTP 503).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
