import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, href, target, rel, children }) => {
  const [hovered, setHovered] = useState(false);
  const style = {
    ...styles.link,
    ...(hovered ? { color: '#0f172a' } : {})
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
  return (
    <span style={styles.techTag}>
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
              <span style={styles.brandTitle}>Nexus Careers</span>
            </div>
            <p style={styles.brandDesc}>
              Enterprise-grade talent and engineering career network. Powered by Hugging Face AI
              models for zero-shot domain tagging and semantic skill-candidate alignment.
            </p>
            <div style={styles.statusPill}>
              <span style={styles.statusDot}></span>
              <span>All Systems Operational • MongoDB Atlas Active</span>
            </div>
          </div>

          <div style={styles.linksGroup}>
            <div style={styles.col}>
              <h4 style={styles.colTitle}>Platform</h4>
              <FooterLink to="/jobs">Browse Positions</FooterLink>
              <FooterLink to="/jobs/recommended">AI Skill Matches</FooterLink>
              <FooterLink to="/login">Sign In</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
            </div>

            <div style={styles.col}>
              <h4 style={styles.colTitle}>Engineering</h4>
              <FooterLink href="https://nexus-api-ullk.onrender.com/api/v1/docs" target="_blank" rel="noreferrer">
                API Docs (OpenAPI 3) ↗
              </FooterLink>
              <FooterLink href="https://nexus-api-ullk.onrender.com/health" target="_blank" rel="noreferrer">
                Health Monitor ↗
              </FooterLink>
              <FooterLink href="https://github.com/ziad7000/nexus" target="_blank" rel="noreferrer">
                Source Repository ↗
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
    background: '#ffffff',
    borderTop: '1px solid #e2e8f0',
    padding: '3rem 1.5rem 2rem',
    color: '#64748b',
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
    borderBottom: '1px solid #f1f5f9'
  },
  brandCol: {
    maxWidth: '380px'
  },
  brandLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '0.75rem'
  },
  logoBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: '#1e40af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.8rem'
  },
  brandTitle: {
    color: '#0f172a',
    fontSize: '1.15rem',
    fontWeight: '700',
    letterSpacing: '-0.01em'
  },
  brandDesc: {
    color: '#475569',
    lineHeight: '1.6',
    marginBottom: '1rem',
    fontSize: '0.85rem'
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.3rem 0.65rem',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#065f46',
    fontWeight: '500'
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#059669'
  },
  linksGroup: {
    display: 'flex',
    gap: '4rem',
    flexWrap: 'wrap'
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  colTitle: {
    color: '#0f172a',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.35rem'
  },
  link: {
    color: '#64748b',
    transition: 'color 0.15s ease',
    textDecoration: 'none',
    fontSize: '0.875rem'
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
    color: '#0f172a',
    fontWeight: '600'
  },
  techStack: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  techTag: {
    padding: '0.2rem 0.5rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '0.725rem',
    color: '#475569',
    fontWeight: '500'
  }
};

export default Footer;
