import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.leftGroup}>
          <Link to="/" style={styles.brand}>
            <div style={styles.logoBadge}>NX</div>
            <span style={styles.brandName}>Nexus</span>
          </Link>
          <div style={styles.systemStatus}>
            <span style={styles.pulseDot}></span>
            <span style={styles.statusText}>Cloud Active</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={styles.nav}>
          <Link to="/" style={isActive('/') ? styles.navLinkActive : styles.navLink}>
            Explore
          </Link>
          <Link to="/jobs" style={isActive('/jobs') ? styles.navLinkActive : styles.navLink}>
            All Jobs
          </Link>

          {isAuthenticated && user?.role === 'jobSeeker' && (
            <>
              <Link to="/jobs/recommended" style={isActive('/jobs/recommended') ? styles.navLinkActive : styles.navLink}>
                AI Matches
              </Link>
              <Link to="/jobs/saved" style={isActive('/jobs/saved') ? styles.navLinkActive : styles.navLink}>
                Saved
              </Link>
              <Link to="/applications/my" style={isActive('/applications/my') ? styles.navLinkActive : styles.navLink}>
                Applications
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <Link to="/recruiter/dashboard" style={isActive('/recruiter/dashboard') ? styles.navLinkActive : styles.navLink}>
                Dashboard
              </Link>
              <Link to="/recruiter/jobs/create" style={styles.postJobBtn}>
                + Post Job
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={isActive('/admin/dashboard') ? styles.navLinkActive : styles.navLink}>
                Overview
              </Link>
              <Link to="/admin/users" style={isActive('/admin/users') ? styles.navLinkActive : styles.navLink}>
                Users
              </Link>
              <Link to="/admin/recruiters" style={isActive('/admin/recruiters') ? styles.navLinkActive : styles.navLink}>
                Approvals
              </Link>
            </>
          )}
        </nav>

        {/* Auth Group */}
        <div style={styles.authGroup}>
          {isAuthenticated ? (
            <div style={styles.userProfile}>
              <Link to="/profile" style={styles.avatarButton}>
                <div style={styles.avatar}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                  <span style={styles.userRole}>{user?.role}</span>
                </div>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
                Sign out
              </button>
            </div>
          ) : (
            <div style={styles.guestButtons}>
              <Link to="/login" style={styles.signInBtn}>
                Sign in
              </Link>
              <Link to="/register" style={styles.signUpBtn}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 999,
    background: 'rgba(8, 9, 13, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '0.75rem 1.5rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    textDecoration: 'none'
  },
  logoBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.85rem',
    letterSpacing: '-0.02em',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
  },
  brandName: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: '1.15rem',
    letterSpacing: '-0.02em'
  },
  systemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.2rem 0.6rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '9999px'
  },
  pulseDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 6px #10b981'
  },
  statusText: {
    color: '#34d399',
    fontSize: '0.7rem',
    fontWeight: '500',
    letterSpacing: '0.02em'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  navLink: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
    textDecoration: 'none'
  },
  navLinkActive: {
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.07)',
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    textDecoration: 'none'
  },
  postJobBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#ffffff',
    fontSize: '0.8125rem',
    fontWeight: '600',
    padding: '0.45rem 0.95rem',
    borderRadius: '8px',
    textDecoration: 'none',
    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  guestButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  signInBtn: {
    color: '#e2e8f0',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'color 0.15s ease'
  },
  signUpBtn: {
    background: '#f8fafc',
    color: '#090a0f',
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.45rem 1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'opacity 0.15s ease'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem'
  },
  avatarButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    textDecoration: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '8px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2'
  },
  userName: {
    color: '#f8fafc',
    fontSize: '0.825rem',
    fontWeight: '600'
  },
  userRole: {
    color: '#64748b',
    fontSize: '0.7rem',
    textTransform: 'capitalize'
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#94a3b8',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  }
};

export default Navbar;
