import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

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
            {/* Direct App Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* Admin Management Routes */}
            <Route path="/admin/audit" element={<AdminAuditLogs />} />
            <Route path="/admin/accounts" element={<AdminAccountManagement />} />
            <Route path="/admin/fraud" element={<AdminFraudDashboard />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
};
