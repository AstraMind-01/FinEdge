import React from 'react';

export const ErrorBanner = ({ message, title = 'Error', type = 'danger' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <div>
        <strong>{title}: </strong>
        <span>{message}</span>
      </div>
    </div>
  );
};
