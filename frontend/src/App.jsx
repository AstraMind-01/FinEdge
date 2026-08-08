import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Customer pages
import { Dashboard } from './pages/Dashboard';
import { AccountDetail } from './pages/AccountDetail';
import { Transactions } from './pages/Transactions';
import { TransactionHistory } from './pages/TransactionHistory';
import { Notifications } from './pages/Notifications';

// Admin pages
import { AdminAuditLogs } from './pages/AdminAuditLogs';
import { AdminAccountManagement } from './pages/AdminAccountManagement';
import { AdminFraudDashboard } from './pages/AdminFraudDashboard';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts/:id"
              element={
                <ProtectedRoute>
                  <AccountDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Protected ADMIN Routes */}
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAccountManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fraud"
              element={
                <ProtectedRoute adminOnly>
                  <AdminFraudDashboard />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};
