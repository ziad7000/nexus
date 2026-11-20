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
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Dashboard</Link>
          <h1 style={styles.title}>Edit Job</h1>
          <p style={styles.subtitle}>Update your job posting - the AI will reclassify if you change the description</p>
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
            <div style={styles.field}>
              <label style={styles.label}>Company Name *</label>
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
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea
                style={getTextareaStyle('description')}
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                required
              />
              <p style={styles.hint}>Changing the description will trigger AI reclassification</p>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Requirements * (comma-separated)</label>
              <input
                style={getInputStyle('requirements')}
                name="requirements"
                placeholder="React, Node.js, MongoDB"
                value={formData.requirements}
                onChange={handleChange}
                onFocus={() => setFocusedField('requirements')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Location *</label>
                <input
                  style={getInputStyle('location')}
                  name="location"
                  placeholder="Cairo or Remote"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('location')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Job Type *</label>
                <CustomDropdown
                  options={[
                    { value: 'full-time', label: 'Full Time' },
                    { value: 'part-time', label: 'Part Time' },
                    { value: 'internship', label: 'Internship' }
                  ]}
                  value={formData.type || 'full-time'}
                  onChange={(e) => handleChange({ target: { name: 'type', value: e.target.value } })}
                  minWidth={160}
                />
              </div>
            </div>
            <div style={styles.row}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Salary (optional)</label>
                <input
                  style={getInputStyle('salary')}
                  name="salary"
                  type="number"
                  placeholder="Monthly salary"
                  value={formData.salary}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('salary')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Open Positions</label>
                <input
                  style={getInputStyle('totalSlots')}
                  name="totalSlots"
                  type="number"
                  min="1"
                  value={formData.totalSlots}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('totalSlots')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Job Status</label>
              <CustomDropdown
                options={[
                  { value: 'open', label: 'Open' },
                  { value: 'closed', label: 'Closed' }
                ]}
                value={formData.status || 'open'}
                onChange={(e) => handleChange({ target: { name: 'status', value: e.target.value } })}
                minWidth={160}
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
                  ...(submitHovered && !saving ? {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                  } : {})
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
  page: { minHeight: '100vh', background: '#08090d', padding: '2rem', position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#2563eb', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none', animation: 'gentlePulse 6s ease-in-out infinite' },
  orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#1d4ed8', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none', animation: 'gentlePulse 6s ease-in-out infinite' },
  container: { maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'slideUp 0.4s ease both' },
  header: { marginBottom: '2rem' },
  backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
  title: { color: '#fff', fontSize: 32, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 14 },
  card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '2rem' },
  field: { marginBottom: '1.5rem' },
  row: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  label: { display: 'block', color: '#999', fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    width: '100%',
    background: '#1e1e1e',
    border: '0.5px solid #2a2a2a',
    borderRadius: 8,
    padding: '12px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  textarea: {
    width: '100%',
    background: '#1e1e1e',
    border: '0.5px solid #2a2a2a',
    borderRadius: 8,
    padding: '12px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  inputFocused: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'
  },
  hint: { color: '#555', fontSize: 12, marginTop: 6 },
  buttons: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
  submitBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  cancelBtn: { background: 'transparent', border: '0.5px solid #2a2a2a', color: '#999', borderRadius: 8, padding: '12px 24px', textDecoration: 'none' },
};

export default EditJobPage;
