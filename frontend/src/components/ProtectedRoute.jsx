import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          <h3>Access Denied</h3>
          <p>You do not have Administrator permissions to view this page.</p>
        </div>
      </div>
    );
  }

  return children;
};
