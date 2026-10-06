import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <div className="spinner"></div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>
  </div>
);
