import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CustomDropdown from '../components/CustomDropdown';

function JobApplicantsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    try {
      const jobRes = await api.get(`/jobs/${jobId}`);
      setJob(jobRes.data.job);

      const appsRes = await api.get(`/jobs/${jobId}/applicants`);
      setApplications(appsRes.data.applications);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdating(applicationId);
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      setApplications(applications.map(app =>
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!job) return <ErrorAlert message="Job not found" />;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Console</Link>
          <span style={styles.preTitle}>CANDIDATE PIPELINE</span>
          <h1 style={styles.title}>Applicants for {job.title}</h1>
          <p style={styles.subtitle}>
            {applications.length} candidate {applications.length === 1 ? 'submission' : 'submissions'} on file for {job.company}
          </p>
        </div>

        {applications.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No Submissions Received Yet</h3>
            <p style={styles.emptySubtitle}>Candidate applications submitted for this opening will appear here.</p>
          </div>
        ) : (
          <div style={styles.applicantsList}>
            {applications.map((app, idx) => (
              <div
                key={app._id}
                style={{
                  ...styles.applicantCard,
                  animation: 'slideUp 0.35s ease both',
                  animationDelay: `${Math.min(idx * 0.04, 0.3)}s`
                }}
              >
                <div style={styles.applicantHeader}>
                  <div style={styles.avatar}>
                    {app.user?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div style={styles.applicantInfo}>
                    <h3 style={styles.applicantName}>{app.user?.name}</h3>
                    <p style={styles.applicantEmail}>{app.user?.email}</p>
                    <div style={styles.skillsContainer}>
                      {app.user?.skills?.slice(0, 5).map((skill, i) => (
                        <span key={i} style={styles.skillChip}>{skill}</span>
                      ))}
                      {app.user?.skills?.length > 5 && (
                        <span style={styles.skillMore}>+{app.user.skills.length - 5}</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.statusSection}>
                    <CustomDropdown
                      options={[
                        { value: 'pending', label: 'Under Review' },
                        { value: 'shortlisted', label: 'Shortlisted' },
                        { value: 'rejected', label: 'Archived' },
                      ]}
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      minWidth={160}
                    />
                    {updating === app._id && <span style={styles.updatingText}>Updating...</span>}
                  </div>
                </div>

                {app.coverLetter && (
                  <div style={styles.coverLetter}>
                    <h4 style={styles.coverLetterTitle}>Cover Statement / Interest Note</h4>
                    <p style={styles.coverLetterText}>{app.coverLetter}</p>
                  </div>
                )}

                <div style={styles.metaFooter}>
                  <span>Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
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
    maxWidth: 920,
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
    fontSize: '1.85rem',
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
  applicantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  applicantCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '1.75rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
  },
  applicantHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    flexWrap: 'wrap'
  },
  avatar: {
    width: 48,
    height: 48,
    background: '#1e40af',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    flexShrink: 0
  },
  applicantInfo: {
    flex: 1,
    minWidth: '220px'
  },
  applicantName: {
    color: '#0f172a',
    fontSize: '1.15rem',
    fontWeight: '700',
    margin: '0 0 0.2rem 0'
  },
  applicantEmail: {
    color: '#64748b',
    fontSize: '0.85rem',
    margin: '0 0 0.65rem 0'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px'
  },
  skillChip: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    color: '#334155',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: '0.725rem',
    fontWeight: '500'
  },
  skillMore: {
    color: '#64748b',
    fontSize: '0.725rem',
    padding: '2px 4px'
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  updatingText: {
    fontSize: '0.725rem',
    color: '#1e40af'
  },
  coverLetter: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '1rem',
    marginTop: '1.25rem'
  },
  coverLetterTitle: {
    color: '#0f172a',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.4rem',
    margin: 0
  },
  coverLetterText: {
    color: '#334155',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginTop: '0.35rem',
    margin: 0
  },
  metaFooter: {
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f1f5f9',
    color: '#64748b',
    fontSize: '0.8rem'
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
  emptySubtitle: {
    fontSize: '0.9rem',
    color: '#64748b'
  }
};

export default JobApplicantsPage;
