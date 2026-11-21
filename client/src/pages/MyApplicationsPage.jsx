import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';

function MyApplicationsPage() {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emptyHovered, setEmptyHovered] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/my');
      setApplications(Array.isArray(response.data?.applications) ? response.data.applications : []);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { background: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', label: 'Under Review' },
      shortlisted: { background: '#ecfdf5', border: '#a7f3d0', color: '#065f46', label: 'Shortlisted' },
      rejected: { background: '#fef2f2', border: '#fecaca', color: '#991b1b', label: 'Archived' }
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span style={{
        ...styles.statusBadge,
        background: s.background,
        border: `1px solid ${s.border}`,
        color: s.color
      }}>
        {s.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loginPrompt}>
            <h1 style={styles.title}>Application Dossier</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Please <Link to="/login" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600 }}>sign in</Link> to view your active submissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/" style={styles.backBtn}>← Return to Explorer</Link>
          <span style={styles.preTitle}>CANDIDATE PORTAL</span>
          <h1 style={styles.title}>Active Applications</h1>
          <p style={styles.subtitle}>Track live application status, employer review progress, and timeline</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : applications.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No Submissions Recorded</h3>
            <p style={styles.emptySub}>You have not submitted any job applications yet.</p>
            <Link
              to="/jobs"
              onMouseEnter={() => setEmptyHovered(true)}
              onMouseLeave={() => setEmptyHovered(false)}
              style={{
                ...styles.emptyBtn,
                ...(emptyHovered ? styles.emptyBtnHover : {})
              }}
            >
              Browse Openings
            </Link>
          </div>
        ) : (
          <div style={styles.applicationsList}>
            {applications.map((app, idx) => (
              <div
                key={app._id}
                style={{
                  ...styles.applicationCard,
                  animation: 'slideUp 0.35s ease both',
                  animationDelay: `${Math.min(idx * 0.04, 0.3)}s`
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.titleGroup}>
                    <h3 style={styles.jobTitle}>{app.job?.title}</h3>
                    <p style={styles.company}>{app.job?.company}</p>
                  </div>
                  <div style={styles.badgeGroup}>
                    <CategoryBadge category={app.job?.category} />
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div style={styles.metaRow}>
                  <span style={styles.metaText}>📍 {app.job?.location}</span>
                  <span style={styles.metaDivider}>•</span>
                  <span style={styles.metaText}>💼 {app.job?.type}</span>
                  <span style={styles.metaDivider}>•</span>
                  <span style={styles.appliedDate}>
                    Submitted {new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div style={styles.cardFooter}>
                  <Link to={`/jobs/${app.job?._id}`} style={styles.viewJobLink}>
                    View Position Overview →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '2.5rem 1.5rem 5rem',
    position: 'relative'
  },
  container: {
    maxWidth: 900,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '2rem'
  },
  backBtn: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '0.75rem'
  },
  preTitle: {
    fontSize: '0.725rem',
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: '0.08em',
    marginBottom: '0.25rem',
    display: 'block'
  },
  title: {
    color: '#0f172a',
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: 0
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '0.35rem',
    margin: 0
  },
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  applicationCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    transition: 'all 0.15s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.85rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  jobTitle: {
    color: '#0f172a',
    fontSize: '1.15rem',
    fontWeight: '700',
    margin: '0 0 0.25rem 0'
  },
  company: {
    color: '#475569',
    fontSize: '0.9rem',
    fontWeight: '500',
    margin: 0
  },
  badgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusBadge: {
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.02em'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
    fontSize: '0.825rem'
  },
  metaText: {
    color: '#64748b',
    fontWeight: '500'
  },
  metaDivider: {
    color: '#cbd5e1'
  },
  appliedDate: {
    color: '#64748b'
  },
  cardFooter: {
    paddingTop: '0.85rem',
    borderTop: '1px solid #f1f5f9'
  },
  viewJobLink: {
    color: '#1e40af',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3.5rem 2rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    color: '#64748b'
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem'
  },
  emptySub: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '1.5rem'
  },
  emptyBtn: {
    display: 'inline-block',
    background: '#1e40af',
    color: '#ffffff',
    padding: '10px 22px',
    borderRadius: 6,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease'
  },
  emptyBtnHover: {
    background: '#1d4ed8'
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '1rem',
    color: '#991b1b',
    textAlign: 'center'
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '3rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12
  }
};

export default MyApplicationsPage;
