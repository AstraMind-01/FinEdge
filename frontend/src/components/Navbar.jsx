import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

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

          <button onClick={handleLogout} className="btn btn-outline-gold" style={{ marginLeft: '1rem' }}>
            Logout ({user.username})
          </button>
        </div>
      </div>
    </nav>
  );
};
