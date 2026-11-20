import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavLinkItem = ({ to, active, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...(active ? styles.navLinkActive : styles.navLink),
        ...(hovered && !active ? { color: '#60a5fa', transform: 'translateY(-1px)' } : {})
      }}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoHovered, setLogoHovered] = useState(false);
  const [projHovered, setProjHovered] = useState(false);
  const [postHovered, setPostHovered] = useState(false);
  const [signInHovered, setSignInHovered] = useState(false);
  const [signUpHovered, setSignUpHovered] = useState(false);

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
          <Link
            to="/"
            style={styles.brand}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <div
              style={{
                ...styles.logoBadge,
                transform: logoHovered ? 'rotate(-5deg) scale(1.08)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            >
              NX
            </div>
            <span style={styles.brandName}>Nexus</span>
          </Link>
          <Link
            to="/project-info"
            onMouseEnter={() => setProjHovered(true)}
            onMouseLeave={() => setProjHovered(false)}
            style={{
              ...(isActive('/project-info') ? styles.projectInfoBtnActive : styles.projectInfoBtn),
              ...(projHovered && !isActive('/project-info') ? {
                borderColor: 'rgba(37, 99, 235, 0.5)',
                background: 'rgba(37, 99, 235, 0.18)'
              } : {})
            }}
            title="View Architecture, Diagnostics & Engineering Docs"
          >
            <span style={styles.pulseDot}></span>
            <span>Project Info</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav style={styles.nav}>
          <NavLinkItem to="/" active={isActive('/')}>
            Explore
          </NavLinkItem>
          <NavLinkItem to="/jobs" active={isActive('/jobs')}>
            All Jobs
          </NavLinkItem>

          {isAuthenticated && user?.role === 'jobSeeker' && (
            <>
              <NavLinkItem to="/jobs/recommended" active={isActive('/jobs/recommended')}>
                AI Matches
              </NavLinkItem>
              <NavLinkItem to="/jobs/saved" active={isActive('/jobs/saved')}>
                Saved
              </NavLinkItem>
              <NavLinkItem to="/applications/my" active={isActive('/applications/my')}>
                Applications
              </NavLinkItem>
            </>
          )}

          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <NavLinkItem to="/recruiter/dashboard" active={isActive('/recruiter/dashboard')}>
                Dashboard
              </NavLinkItem>
              <Link
                to="/recruiter/jobs/create"
                onMouseEnter={() => setPostHovered(true)}
                onMouseLeave={() => setPostHovered(false)}
                style={{
                  ...styles.postJobBtn,
                  transform: postHovered ? 'translateY(-1px)' : 'none',
                  boxShadow: postHovered
                    ? '0 4px 16px rgba(16, 185, 129, 0.3)'
                    : '0 2px 10px rgba(16, 185, 129, 0.3)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                + Post Job
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <NavLinkItem to="/admin/dashboard" active={isActive('/admin/dashboard')}>
                Overview
              </NavLinkItem>
              <NavLinkItem to="/admin/users" active={isActive('/admin/users')}>
                Users
              </NavLinkItem>
              <NavLinkItem to="/admin/recruiters" active={isActive('/admin/recruiters')}>
                Approvals
              </NavLinkItem>
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
              <Link
                to="/login"
                onMouseEnter={() => setSignInHovered(true)}
                onMouseLeave={() => setSignInHovered(false)}
                style={{
                  ...styles.signInBtn,
                  ...(signInHovered ? { color: '#ffffff' } : {})
                }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onMouseEnter={() => setSignUpHovered(true)}
                onMouseLeave={() => setSignUpHovered(false)}
                style={{
                  ...styles.signUpBtn,
                  ...(signUpHovered ? { opacity: 0.9, transform: 'translateY(-1px)' } : {})
                }}
              >
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
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.85rem',
    letterSpacing: '-0.02em',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
  },
  brandName: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: '1.15rem',
    letterSpacing: '-0.02em'
  },
  projectInfoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.3rem 0.75rem',
    background: 'rgba(37, 99, 235, 0.1)',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    borderRadius: '9999px',
    color: '#93c5fd',
    fontSize: '0.75rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'border-color 0.2s ease, background 0.2s ease, color 0.2s ease'
  },
  projectInfoBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.3rem 0.75rem',
    background: 'rgba(37, 99, 235, 0.25)',
    border: '1px solid #3b82f6',
    borderRadius: '9999px',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
    transition: 'border-color 0.2s ease, background 0.2s ease, color 0.2s ease'
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
    transition: 'color 0.2s ease, transform 0.15s ease',
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
    transition: 'opacity 0.15s ease, transform 0.15s ease'
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
    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'flex-start',
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
