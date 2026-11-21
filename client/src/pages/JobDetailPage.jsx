import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CategoryBadge from '../components/CategoryBadge';
import SaveJobButton from '../components/SaveJobButton';

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState('');
  const [applyBtnHovered, setApplyBtnHovered] = useState(false);
  const [submitBtnHovered, setSubmitBtnHovered] = useState(false);

  useEffect(() => {
    fetchJob();
    if (isAuthenticated && user?.role === 'jobSeeker') {
      checkApplicationStatus();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data?.job);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Job not found');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/applications/my');
      const apps = Array.isArray(response.data?.applications) ? response.data.applications : [];
      const applied = apps.some(app => app.job?._id === id);
      setHasApplied(applied);
      const app = apps.find(app => app.job?._id === id);
      if (app) setApplicationStatus(app.status);
    } catch (err) {
      console.error('Failed to check application status');
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, { coverLetter });
      setHasApplied(true);
      setApplicationStatus('pending');
      setShowApplyModal(false);
      setCoverLetter('');
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingCoverLetter(true);
    setCoverLetterError('');
    try {
      const response = await api.post(`/jobs/${id}/cover-letter`);
      setCoverLetter(response.data.coverLetter);
    } catch (err) {
      setCoverLetterError('Failed to generate cover letter. Try again.');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!job) return <ErrorAlert message="Job not found" />;

  const remaining = job.remainingSlots !== undefined ? job.remainingSlots : job.totalSlots;
  const isFilled = remaining === 0 || job.status === 'closed';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/jobs" style={styles.backBtn}>← Back to Openings Directory</Link>
        
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.companyBadgeSection}>
              <div style={styles.companyAvatar}>
                {job.company?.[0]?.toUpperCase() || 'C'}
              </div>
              <div>
                <h1 style={styles.title}>{job.title}</h1>
                <p style={styles.company}>{job.company}</p>
              </div>
            </div>

            <div style={styles.actions}>
              <SaveJobButton jobId={job._id} initialSaved={job.isSaved} />
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={styles.metaStrip}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Domain</span>
              <CategoryBadge category={job.category} />
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Location</span>
              <span style={styles.metaVal}>📍 {job.location}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Employment</span>
              <span style={styles.metaVal}>💼 {job.type}</span>
            </div>
            {job.salary && (
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Compensation</span>
                <span style={styles.salaryVal}>${job.salary.toLocaleString()}/yr</span>
              </div>
            )}
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>Capacity</span>
              <span style={isFilled ? styles.slotFilled : styles.slotOpen}>
                <span style={isFilled ? styles.slotDotFilled : styles.slotDotOpen}></span>
                {isFilled ? 'Positions Filled' : `${remaining} ${remaining === 1 ? 'Slot' : 'Slots'} Open`}
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={styles.section}>
            <h3 style={styles.sectionHeading}>Position Overview</h3>
            <p style={styles.description}>{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Key Competencies & Requirements</h3>
              <div style={styles.reqGrid}>
                {job.requirements.map((req, i) => (
                  <div key={i} style={styles.reqCard}>
                    <span style={styles.reqCheck}>✓</span>
                    <span style={styles.reqText}>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Action Area */}
          <div style={styles.applySection}>
            {isAuthenticated ? (
              user?.role === 'jobSeeker' ? (
                hasApplied ? (
                  <div style={styles.appliedBox}>
                    <div style={styles.appliedIcon}>✓</div>
                    <div>
                      <div style={styles.appliedText}>Application Active on File</div>
                      <div style={styles.appliedStatus}>
                        Current Status: <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{applicationStatus || 'Under Review'}</strong>
                      </div>
                    </div>
                  </div>
                ) : isFilled ? (
                  <div style={styles.closedBox}>
                    This position has reached maximum capacity and is no longer accepting submissions.
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    onMouseEnter={() => setApplyBtnHovered(true)}
                    onMouseLeave={() => setApplyBtnHovered(false)}
                    style={{
                      ...styles.applyBtn,
                      ...(applyBtnHovered ? styles.applyBtnHover : {})
                    }}
                  >
                    Submit Application for {job.title} →
                  </button>
                )
              ) : (
                <div style={styles.roleNotice}>
                  Logged in as <strong>{user?.role}</strong>. Applications are reserved for Candidate accounts.
                </div>
              )
            ) : (
              <div style={styles.loginPrompt}>
                <p style={{ margin: '0 0 1rem', color: '#475569' }}>Sign in to submit your verified profile directly to the hiring team.</p>
                <button onClick={() => navigate('/login')} style={styles.loginBtn}>
                  Sign in to Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Apply for {job.title}</h3>
              <p style={styles.modalSub}>Submission to {job.company}</p>
            </div>

            <button
              onClick={handleGenerateCoverLetter}
              disabled={generatingCoverLetter}
              style={styles.generateBtn}
            >
              {generatingCoverLetter ? 'Synthesizing with Hugging Face AI...' : '⚡ Generate Cover Letter with AI'}
            </button>
            {coverLetterError && <ErrorAlert message={coverLetterError} />}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={styles.modalLabel}>Cover Letter & Statement of Interest</label>
              <textarea
                style={styles.modalTextarea}
                rows={6}
                placeholder="Detail your engineering background, production systems experience, and why you are interested in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setShowApplyModal(false)}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying}
                onMouseEnter={() => setSubmitBtnHovered(true)}
                onMouseLeave={() => setSubmitBtnHovered(false)}
                style={{
                  ...styles.modalSubmit,
                  ...(submitBtnHovered && !applying ? styles.modalSubmitHover : {})
                }}
              >
                {applying ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  backBtn: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '1.25rem'
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '2.5rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.75rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  companyBadgeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  companyAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '10px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  title: {
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: 0
  },
  company: {
    color: '#475569',
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '0.25rem',
    margin: 0
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  metaStrip: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    padding: '1.25rem 0',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '2rem'
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.04em'
  },
  metaVal: {
    color: '#0f172a',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  salaryVal: {
    color: '#15803d',
    fontSize: '0.875rem',
    fontWeight: '700'
  },
  slotOpen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#065f46',
    fontSize: '0.825rem',
    fontWeight: '600'
  },
  slotDotOpen: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#059669'
  },
  slotFilled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#b91c1c',
    fontSize: '0.825rem',
    fontWeight: '600'
  },
  slotDotFilled: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#dc2626'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionHeading: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01em'
  },
  description: {
    color: '#334155',
    fontSize: '0.95rem',
    lineHeight: '1.7',
    whiteSpace: 'pre-line'
  },
  reqGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '0.75rem',
    marginTop: '0.5rem'
  },
  reqCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  reqCheck: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: '0.85rem'
  },
  reqText: {
    color: '#334155',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  applySection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0'
  },
  applyBtn: {
    background: '#1e40af',
    border: 'none',
    borderRadius: 8,
    padding: '14px 28px',
    color: '#ffffff',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.15s ease'
  },
  applyBtnHover: {
    background: '#1d4ed8',
    transform: 'translateY(-1px)'
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: 8,
    border: '1px solid #e2e8f0'
  },
  loginBtn: {
    background: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '10px 24px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  appliedBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: 8,
    padding: '1.25rem'
  },
  appliedIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#059669',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700'
  },
  appliedText: {
    color: '#065f46',
    fontWeight: '700',
    fontSize: '0.95rem'
  },
  appliedStatus: {
    color: '#047857',
    fontSize: '0.825rem',
    marginTop: 2
  },
  closedBox: {
    textAlign: 'center',
    padding: '1.25rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#991b1b',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  roleNotice: {
    textAlign: 'center',
    padding: '1.25rem',
    background: '#f1f5f9',
    borderRadius: 8,
    color: '#475569',
    fontSize: '0.875rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '2rem',
    width: '90%',
    maxWidth: 540,
    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)'
  },
  modalHeader: {
    marginBottom: '1.25rem'
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: '1.35rem',
    fontWeight: '700',
    margin: 0
  },
  modalSub: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '0.2rem',
    margin: 0
  },
  modalLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: '6px'
  },
  modalTextarea: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '12px',
    color: '#0f172a',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    lineHeight: '1.5'
  },
  modalButtons: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem'
  },
  modalCancel: {
    background: 'transparent',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '9px 18px',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  generateBtn: {
    width: '100%',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    padding: '10px',
    borderRadius: 8,
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1.25rem'
  },
  modalSubmit: {
    background: '#1e40af',
    border: 'none',
    borderRadius: 6,
    padding: '9px 20px',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  modalSubmitHover: {
    background: '#1d4ed8'
  }
};

export default JobDetailPage;
