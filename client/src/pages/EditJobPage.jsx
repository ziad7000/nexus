import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CustomDropdown from '../components/CustomDropdown';

function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time',
    salary: '',
    totalSlots: 1,
    status: 'open'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitHovered, setSubmitHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      const job = response.data.job;
      setFormData({
        title: job.title,
        company: job.company,
        description: job.description,
        requirements: job.requirements?.join(', ') || '',
        location: job.location,
        type: job.type,
        salary: job.salary || '',
        totalSlots: job.totalSlots || 1,
        status: job.status
      });
    } catch (err) {
      setError('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocused : {})
  });

  const getTextareaStyle = (fieldName) => ({
    ...styles.textarea,
    ...(focusedField === fieldName ? styles.inputFocused : {})
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const requirementsArray = formData.requirements.split(',').map(r => r.trim()).filter(r => r);

    try {
      await api.patch(`/jobs/${id}`, {
        ...formData,
        requirements: requirementsArray,
        salary: formData.salary ? parseInt(formData.salary) : undefined
      });
      navigate(`/jobs/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Console</Link>
          <h1 style={styles.title}>Edit Opening</h1>
          <p style={styles.subtitle}>Update role parameters, description, and status</p>
        </div>

        <div style={styles.card}>
          <ErrorAlert message={error} />
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Job Title *</label>
              <input
                style={getInputStyle('title')}
                name="title"
                value={formData.title}
                onChange={handleChange}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Company *</label>
                <input
                  style={getInputStyle('company')}
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('company')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>

              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Location *</label>
                <input
                  style={getInputStyle('location')}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Employment Type *</label>
                <CustomDropdown
                  options={[
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                    { value: 'internship', label: 'Internship' }
                  ]}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>

              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Salary ($ USD)</label>
                <input
                  style={getInputStyle('salary')}
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('salary')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>

              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Status *</label>
                <CustomDropdown
                  options={[
                    { value: 'open', label: 'Active (Open)' },
                    { value: 'closed', label: 'Archived (Closed)' }
                  ]}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Job Description *</label>
              <textarea
                style={getTextareaStyle('description')}
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Requirements (Comma-separated) *</label>
              <input
                style={getInputStyle('requirements')}
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                onFocus={() => setFocusedField('requirements')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>

            <div style={styles.buttons}>
              <button
                type="submit"
                disabled={saving}
                onMouseEnter={() => setSubmitHovered(true)}
                onMouseLeave={() => setSubmitHovered(false)}
                style={{
                  ...styles.submitBtn,
                  ...(submitHovered && !saving ? styles.submitBtnHover : {})
                }}
              >
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
              <Link to="/recruiter/dashboard" style={styles.cancelBtn}>Cancel</Link>
            </div>
          </form>
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
    maxWidth: 820,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '1.75rem'
  },
  backBtn: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'inline-block',
    marginBottom: '0.75rem'
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
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
  },
  field: {
    marginBottom: '1.25rem'
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  label: {
    display: 'block',
    color: '#475569',
    fontSize: '0.725rem',
    fontWeight: '700',
    marginBottom: '6px',
    textTransform: 'uppercase'
  },
  input: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '11px 13px',
    color: '#0f172a',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease'
  },
  textarea: {
    width: '100%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '11px 13px',
    color: '#0f172a',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    lineHeight: '1.5',
    transition: 'all 0.15s ease'
  },
  inputFocused: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)'
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '1.75rem'
  },
  submitBtn: {
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: 6,
    padding: '11px 24px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  submitBtnHover: {
    background: '#1e293b'
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid #cbd5e1',
    color: '#475569',
    borderRadius: 6,
    padding: '10px 20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default EditJobPage;
