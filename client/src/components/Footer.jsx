import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, href, target, rel, children }) => {
  const [hovered, setHovered] = useState(false);
  const style = {
    ...styles.link,
    ...(hovered ? { color: '#e2e8f0' } : {})
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={style}
    >
      {children}
    </Link>
  );
};

const TechTagItem = ({ children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.techTag,
        ...(hovered ? { borderColor: 'rgba(255, 255, 255, 0.15)', color: '#94a3b8' } : {})
      }}
    >
      {children}
    </span>
  );
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.topSection}>
          <div style={styles.brandCol}>
            <div style={styles.brandLogo}>
              <div style={styles.logoBadge}>NX</div>
              <span style={styles.brandTitle}>Nexus</span>
            </div>
            <p style={styles.brandDesc}>
              Full-stack career platform powered by Hugging Face AI models for intelligent
              talent matching, resume parsing, and personalized job recommendations.
            </p>
            <div style={styles.statusPill}>
              <span style={styles.statusDot}></span>
              <span>All Systems Operational • MongoDB Atlas Active</span>
            </div>
          </div>

          <div style={styles.linksGroup}>
            <div style={styles.col}>
              <h4 style={styles.colTitle}>Platform</h4>
              <FooterLink to="/jobs">Browse Jobs</FooterLink>
              <FooterLink to="/jobs/recommended">AI Matches</FooterLink>
              <FooterLink to="/login">Sign In</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
            </div>

            <div style={styles.col}>
              <h4 style={styles.colTitle}>Engineering</h4>
              <FooterLink href="https://nexus-api-ullk.onrender.com/api/v1/docs" target="_blank" rel="noreferrer">
                Swagger UI (OpenAPI 3) ↗
              </FooterLink>
              <FooterLink href="https://nexus-api-ullk.onrender.com/health" target="_blank" rel="noreferrer">
                Live Health Status ↗
              </FooterLink>
              <FooterLink href="https://github.com/ziad7000/nexus" target="_blank" rel="noreferrer">
                GitHub Repository ↗
              </FooterLink>
            </div>
          </div>
        </div>

        <div style={styles.bottomBar}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Nexus. Engineered by <span style={styles.author}>Ziad Islam</span>. Released under the MIT License.
          </p>
          <div style={styles.techStack}>
            <TechTagItem>React 19</TechTagItem>
            <TechTagItem>Node 22 LTS</TechTagItem>
            <TechTagItem>Express 5</TechTagItem>
            <TechTagItem>Docker</TechTagItem>
            <TechTagItem>MongoDB 7</TechTagItem>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#06070a',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '3.5rem 1.5rem 2rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginTop: 'auto',
    width: '100%',
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '3rem',
    flexWrap: 'wrap',
    paddingBottom: '2.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  brandCol: {
    maxWidth: '380px'
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  logoBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '800',
    fontSize: '0.875rem',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
  },
  brandTitle: {
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.02em'
  },
  brandDesc: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '1.25rem'
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.75rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    color: '#34d399',
    fontWeight: '500'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981',
    animation: 'gentlePulse 2s ease-in-out infinite'
  },
  linksGroup: {
    display: 'flex',
    gap: '4rem',
    flexWrap: 'wrap'
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  },
  colTitle: {
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem'
  },
  link: {
    color: '#94a3b8',
    transition: 'color 0.15s ease',
    textDecoration: 'none'
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  copyright: {
    color: '#64748b',
    fontSize: '0.8125rem'
  },
  author: {
    color: '#e2e8f0',
    fontWeight: '600'
  },
  techStack: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  techTag: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#64748b',
    transition: 'border-color 0.2s ease, color 0.2s ease'
  }
};

export default Footer;
