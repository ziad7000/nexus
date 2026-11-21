import React, { useState, useEffect } from 'react';
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
        ...(hovered && !active ? styles.navLinkHover : {})
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 860);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
                transform: logoHovered ? 'scale(1.05)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            >
              NX
            </div>
            <div style={styles.brandTextGroup}>
              <span style={styles.brandName}>NEXUS</span>
              <span style={styles.brandSub}>CAREERS</span>
            </div>
          </Link>

          {!isMobile && (
            <Link
              to="/project-info"
              onMouseEnter={() => setProjHovered(true)}
              onMouseLeave={() => setProjHovered(false)}
              style={{
                ...(isActive('/project-info') ? styles.projectInfoBtnActive : styles.projectInfoBtn),
                ...(projHovered && !isActive('/project-info') ? styles.projectInfoBtnHover : {})
              }}
              title="View Architecture, Diagnostics & Engineering Docs"
            >
              <span style={{ ...styles.pulseDot, ...(isActive('/project-info') ? { background: '#93c5fd' } : {}) }}></span>
              <span>Project Docs</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation Links */}
        {!isMobile && (
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
                      ? '0 4px 12px rgba(30, 64, 175, 0.25)'
                      : '0 1px 3px rgba(15, 23, 42, 0.08)'
                  }}
                >
                  + Post Opening
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
        )}

        {/* Desktop Auth Group */}
        {!isMobile && (
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
                    ...(signInHovered ? { color: '#0f172a' } : {})
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
                    ...(signUpHovered ? { background: '#1d4ed8', transform: 'translateY(-1px)' } : {})
                  }}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile Hamburger Toggle Button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.mobileToggleBtn}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobile && mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <Link
            to="/project-info"
            style={{
              ...(isActive('/project-info') ? styles.mobileLinkActive : styles.mobileLink),
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#1e40af',
              fontWeight: '600'
            }}
          >
            <span style={{ ...styles.pulseDot, ...(isActive('/project-info') ? { background: '#93c5fd' } : {}) }}></span>
            <span>Project Docs & Architecture</span>
          </Link>

          <Link to="/" style={isActive('/') ? styles.mobileLinkActive : styles.mobileLink}>
            Explore Directory
          </Link>
          <Link to="/jobs" style={isActive('/jobs') ? styles.mobileLinkActive : styles.mobileLink}>
            All Jobs
          </Link>

          {isAuthenticated && user?.role === 'jobSeeker' && (
            <>
              <Link to="/jobs/recommended" style={isActive('/jobs/recommended') ? styles.mobileLinkActive : styles.mobileLink}>
                AI Matches
              </Link>
              <Link to="/jobs/saved" style={isActive('/jobs/saved') ? styles.mobileLinkActive : styles.mobileLink}>
                Saved Openings
              </Link>
              <Link to="/applications/my" style={isActive('/applications/my') ? styles.mobileLinkActive : styles.mobileLink}>
                My Applications
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'recruiter' && (
            <>
              <Link to="/recruiter/dashboard" style={isActive('/recruiter/dashboard') ? styles.mobileLinkActive : styles.mobileLink}>
                Dashboard
              </Link>
              <Link to="/recruiter/jobs/create" style={styles.mobilePostBtn}>
                + Post Opening
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" style={isActive('/admin/dashboard') ? styles.mobileLinkActive : styles.mobileLink}>
                Overview
              </Link>
              <Link to="/admin/users" style={isActive('/admin/users') ? styles.mobileLinkActive : styles.mobileLink}>
                Users
              </Link>
              <Link to="/admin/recruiters" style={isActive('/admin/recruiters') ? styles.mobileLinkActive : styles.mobileLink}>
                Approvals
              </Link>
            </>
          )}

          <div style={styles.mobileDivider} />

          {isAuthenticated ? (
            <div style={styles.mobileAuthRow}>
              <Link to="/profile" style={styles.mobileProfileBtn}>
                <div style={styles.avatar}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={styles.userName}>{user?.name}</div>
                  <div style={styles.userRole}>{user?.role}</div>
                </div>
              </Link>
              <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={styles.mobileGuestActions}>
              <Link to="/login" style={styles.mobileSignInBtn}>
                Sign In
              </Link>
              <Link to="/register" style={styles.mobileSignUpBtn}>
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 999,
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0.75rem 1.5rem',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px 0 rgba(15, 23, 42, 0.03)'
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
    borderRadius: '6px',
    background: '#1e40af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.85rem',
    letterSpacing: '-0.02em',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.15)'
  },
  brandTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.1'
  },
  brandName: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '1.1rem',
    letterSpacing: '0.04em'
  },
  brandSub: {
    color: '#64748b',
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.12em'
  },
  projectInfoBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.35rem 0.8rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    color: '#1e40af',
    fontSize: '0.75rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(30, 64, 175, 0.05)'
  },
  projectInfoBtnHover: {
    background: '#dbeafe',
    color: '#1d4ed8',
    borderColor: '#93c5fd',
    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.1)'
  },
  projectInfoBtnActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.35rem 0.8rem',
    background: '#1e40af',
    border: '1px solid #1e40af',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.2)'
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2563eb'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  navLink: {
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.45rem 0.75rem',
    borderRadius: '6px',
    transition: 'color 0.15s ease, background 0.15s ease',
    textDecoration: 'none'
  },
  navLinkHover: {
    color: '#0f172a',
    background: '#f8fafc'
  },
  navLinkActive: {
    color: '#0f172a',
    background: '#f1f5f9',
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.45rem 0.75rem',
    borderRadius: '6px',
    textDecoration: 'none'
  },
  postJobBtn: {
    background: '#1e40af',
    color: '#ffffff',
    fontSize: '0.8125rem',
    fontWeight: '600',
    padding: '0.45rem 0.95rem',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  guestButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem'
  },
  signInBtn: {
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'color 0.15s ease'
  },
  signUpBtn: {
    background: '#1e40af',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.45rem 0.95rem',
    borderRadius: '6px',
    textDecoration: 'none',
    transition: 'background 0.15s ease, transform 0.15s ease'
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  avatarButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    textDecoration: 'none',
    padding: '0.2rem 0.4rem',
    borderRadius: '6px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#1e40af',
    color: '#ffffff',
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
    color: '#0f172a',
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
    border: '1px solid #cbd5e1',
    color: '#64748b',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  mobileToggleBtn: {
    background: 'transparent',
    border: 'none',
    padding: '6px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f172a'
  },
  mobileMenu: {
    padding: '1rem 0 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    borderTop: '1px solid #f1f5f9',
    marginTop: '0.75rem',
    animation: 'slideDown 0.2s ease both'
  },
  mobileLink: {
    color: '#475569',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    textDecoration: 'none'
  },
  mobileLinkActive: {
    color: '#0f172a',
    background: '#f1f5f9',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    textDecoration: 'none'
  },
  mobilePostBtn: {
    background: '#1e40af',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.65rem 1rem',
    borderRadius: '6px',
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: '0.25rem'
  },
  mobileDivider: {
    height: '1px',
    background: '#e2e8f0',
    margin: '0.5rem 0'
  },
  mobileAuthRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0'
  },
  mobileProfileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none'
  },
  mobileLogoutBtn: {
    background: 'transparent',
    border: '1px solid #cbd5e1',
    color: '#64748b',
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  mobileGuestActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.35rem'
  },
  mobileSignInBtn: {
    flex: 1,
    textAlign: 'center',
    padding: '0.6rem 1rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.875rem',
    textDecoration: 'none'
  },
  mobileSignUpBtn: {
    flex: 1,
    textAlign: 'center',
    padding: '0.6rem 1rem',
    background: '#1e40af',
    borderRadius: '6px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.875rem',
    textDecoration: 'none'
  }
};

export default Navbar;
