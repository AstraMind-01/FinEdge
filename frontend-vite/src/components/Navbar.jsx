import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAdmin, currentMode, switchMode } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="brand animate-scale-up">
          <span>FinEdge<span style={{ color: 'var(--color-accent)' }}>.</span></span>
          <span className="brand-badge">{isAdmin ? 'ADMIN' : 'BANKING'}</span>
        </Link>

        <div className="nav-links animate-slide-up">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Transfer & Actions
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            History
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Notifications
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/admin/audit" className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}>
                Audit Logs
              </NavLink>
              <NavLink to="/admin/accounts" className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}>
                Manage Accounts
              </NavLink>
              <NavLink to="/admin/fraud" className={({ isActive }) => `nav-link admin-link ${isActive ? 'active' : ''}`}>
                Fraud Monitor
              </NavLink>
            </>
          )}

          {/* Interactive Role Switcher Toggle */}
          <button
            onClick={() => switchMode()}
            title="Click to toggle between Admin and Customer user modes"
            style={{
              marginLeft: '1rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.82rem',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: isAdmin ? 'rgba(212, 175, 55, 0.18)' : 'rgba(52, 152, 219, 0.18)',
              border: isAdmin ? '1px solid rgba(212, 175, 55, 0.6)' : '1px solid rgba(52, 152, 219, 0.6)',
              color: isAdmin ? '#d4af37' : '#3498db',
            }}
          >
            <span>{isAdmin ? '🛡️ Admin Mode' : '👤 Customer Mode'}</span>
            <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>(Switch ⇄)</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
