import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

function RecommendedJobsPage() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emptyHovered, setEmptyHovered] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchRecommendedJobs();
  }, [isAuthenticated]);

  const fetchRecommendedJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/recommended');
      setJobs(Array.isArray(response.data?.jobs) ? response.data.jobs : []);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loginPrompt}>
            <h1 style={styles.title}>AI Recommendations</h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
              Please <Link to="/login" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600 }}>sign in</Link> to view personalized skill matches.
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
          <span style={styles.preTitle}>INTELLIGENT MATCHING ENGINE</span>
          <h1 style={styles.title}>AI-Recommended Positions</h1>
          <p style={styles.subtitle}>Ranked by semantic vector similarity between your profile skills and job embeddings</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No Recommendations Computed Yet</h3>
            <p style={styles.emptySub}>Add technical competencies to your profile to generate high-affinity matches.</p>
            <Link
              to="/profile"
              onMouseEnter={() => setEmptyHovered(true)}
              onMouseLeave={() => setEmptyHovered(false)}
              style={{
                ...styles.emptyBtn,
                ...(emptyHovered ? styles.emptyBtnHover : {})
              }}
            >
              Update Profile Skills
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.count}>Showing {jobs.length} roles ranked by AI alignment</div>
            <div style={styles.grid}>
              {jobs.map((job, idx) => (
                <JobCard key={job._id} job={job} index={idx} />
              ))}
            </div>
          </>
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
    maxWidth: 1200,
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
  count: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.25rem'
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
    background: '#0f172a',
    color: '#ffffff',
    padding: '10px 22px',
    borderRadius: 6,
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease'
  },
  emptyBtnHover: {
    background: '#1e293b'
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

export default RecommendedJobsPage;
