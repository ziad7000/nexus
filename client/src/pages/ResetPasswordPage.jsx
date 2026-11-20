import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      const res = await api.patch(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{success ? 'Password Updated' : 'Set New Password'}</h1>
        <p style={styles.subtitle}>{success ? 'Redirecting to your workspace...' : 'Enter your new secure password credentials'}</p>
        <ErrorAlert message={error} />
        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>New Password</label>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocused : {})
                }}
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                style={{
                  ...styles.input,
                  ...(focusedField === 'confirm' ? styles.inputFocused : {})
                }}
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                ...styles.btn,
                ...(btnHovered && !loading ? styles.btnHover : {})
              }}
            >
              {loading ? 'Updating Credentials...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 1.5rem'
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05)'
  },
  title: {
    fontSize: '1.45rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.35rem',
    letterSpacing: '-0.01em'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginBottom: '1.75rem'
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
  btn: {
    width: '100%',
    background: '#0f172a',
    border: 'none',
    borderRadius: 6,
    padding: '11px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  btnHover: {
    background: '#1e293b'
  }
};

export default ResetPasswordPage;
