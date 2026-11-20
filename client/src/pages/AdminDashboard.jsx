import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={styles.errorBox}>{error}</div>;

  const statCardsData = [
    { label: 'Engineering Candidates', value: stats?.usersByRole?.jobSeeker || 0, sub: 'Registered job seekers' },
    { label: 'Verified Recruiters', value: stats?.usersByRole?.recruiter || 0, sub: 'Technical hiring accounts' },
    { label: 'Active Openings', value: stats?.jobsByStatus?.open || 0, sub: 'Direct employer listings' },
    { label: 'Pending Applications', value: stats?.appsByStatus?.pending || 0, sub: 'Under recruiter review' }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <span style={styles.preTitle}>EXECUTIVE ADMINISTRATION</span>
            <h1 style={styles.title}>System Overview</h1>
            <p style={styles.subtitle}>Welcome back, {user?.name}. Global metrics and governance control panel.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {statCardsData.map((stat, idx) => (
            <div
              key={idx}
              style={{
                ...styles.statCard,
                animation: 'slideUp 0.3s ease both',
                animationDelay: `${idx * 0.05}s`
              }}
            >
              <div style={styles.statLabel}>{stat.label}</div>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statSub}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Top Jobs Section */}
        {stats?.topJobs?.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>High-Velocity Positions</h2>
              <span style={styles.sectionMeta}>Ranked by application volume</span>
            </div>
            <div style={styles.topJobsList}>
              {stats.topJobs.map((job, idx) => (
                <div key={idx} style={styles.topJobCard}>
                  <div style={styles.topJobRank}>#{idx + 1}</div>
                  <div style={styles.topJobInfo}>
                    <div style={styles.topJobTitle}>{job.title}</div>
                    <div style={styles.topJobCompany}>{job.company}</div>
                  </div>
                  <div style={styles.topJobCount}>{job.applicationCount} submissions</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Governance & Management Modules</h2>
          </div>
          <div style={styles.actionsGrid}>
            <Link to="/admin/users" style={styles.actionCard}>
              <div style={styles.actionTitle}>User Management Directory →</div>
              <p style={styles.actionDesc}>Manage all registered candidate and employer records, roles, and status controls.</p>
            </Link>
            <Link to="/admin/recruiters" style={styles.actionCard}>
              <div style={styles.actionTitle}>Recruiter Verification Queue →</div>
              <p style={styles.actionDesc}>Review and verify incoming employer accounts to grant position publication permissions.</p>
            </Link>
            <Link to="/admin/jobs" style={styles.actionCard}>
              <div style={styles.actionTitle}>Vacancies & Openings Oversight →</div>
              <p style={styles.actionDesc}>Inspect all listings across domains, verify parameters, and enforce platform standards.</p>
            </Link>
          </div>
        </div>
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
    maxWidth: 1100,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '2rem'
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem'
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  statValue: {
    color: '#0f172a',
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0.35rem 0 0.15rem 0',
    letterSpacing: '-0.02em'
  },
  statSub: {
    color: '#94a3b8',
    fontSize: '0.75rem'
  },
  section: {
    marginBottom: '2.5rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '1rem'
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.01em',
    margin: 0
  },
  sectionMeta: {
    color: '#64748b',
    fontSize: '0.8rem'
  },
  topJobsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  topJobCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)'
  },
  topJobRank: {
    width: 28,
    height: 28,
    background: '#f1f5f9',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '0.8rem'
  },
  topJobInfo: {
    flex: 1
  },
  topJobTitle: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  topJobCompany: {
    color: '#64748b',
    fontSize: '0.8rem'
  },
  topJobCount: {
    color: '#1e40af',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem'
  },
  actionCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '1.5rem',
    textDecoration: 'none',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
    transition: 'all 0.15s ease'
  },
  actionTitle: {
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '0.5rem'
  },
  actionDesc: {
    color: '#64748b',
    fontSize: '0.825rem',
    lineHeight: '1.5',
    margin: 0
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '1rem',
    color: '#991b1b',
    textAlign: 'center'
  }
};

export default AdminDashboard;
