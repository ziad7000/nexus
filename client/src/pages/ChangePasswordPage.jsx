import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveHovered, setSaveHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.patch('/profile/change-password', { currentPassword, newPassword });
      setSuccess('Password updated successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocused : {})
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/profile" style={styles.backBtn}>← Back to Profile</Link>
          <h1 style={styles.title}>Update Password</h1>
          <p style={styles.subtitle}>Maintain your account security with regular credential updates</p>
        </div>
        <div style={styles.card}>
          <ErrorAlert message={error} />
          {success && <div style={styles.success}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Current Password</label>
              <input
                style={getInputStyle('current')}
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onFocus={() => setFocusedField('current')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                style={getInputStyle('new')}
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocusedField('new')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                style={getInputStyle('confirm')}
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <div style={styles.buttons}>
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setSaveHovered(true)}
                onMouseLeave={() => setSaveHovered(false)}
                style={{
                  ...styles.saveBtn,
                  ...(saveHovered && !loading ? styles.saveBtnHover : {})
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
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
    padding: '2.5rem 1.5rem',
    position: 'relative'
  },
  container: {
    maxWidth: 520,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '1.5rem'
  },
  backBtn: {
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '1rem'
  },
  title: {
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: 0
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
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
  inputFocused: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)'
  },
  buttons: {
    marginTop: '1.75rem'
  },
  saveBtn: {
    width: '100%',
    background: '#1e40af',
    border: 'none',
    borderRadius: 6,
    padding: '11px',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  saveBtnHover: {
    background: '#1d4ed8'
  },
  success: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '10px 14px',
    borderRadius: 6,
    marginBottom: '1rem',
    fontSize: '0.85rem',
    fontWeight: '500'
  }
};

export default ChangePasswordPage;
