import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Password Reset Initiated</h1>
          <p style={styles.subtitle}>Instructions and a secure reset link have been dispatched to <strong>{email}</strong>.</p>
          <Link
            to="/login"
            style={styles.btn}
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reset Your Password</h1>
        <p style={styles.subtitle}>Enter your verified email address to receive password recovery instructions.</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={{
                ...styles.input,
                ...(focusedField === 'email' ? styles.inputFocused : {})
              }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="you@example.com"
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
            {loading ? 'Dispatching...' : 'Send Reset Link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
          <Link to="/login" style={{ color: '#1e40af', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
            Back to Sign In
          </Link>
        </p>
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
    marginBottom: '1.75rem',
    lineHeight: '1.5'
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
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '0.875rem',
    transition: 'all 0.15s ease'
  },
  inputFocused: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)'
  },
  btn: {
    width: '100%',
    background: '#1e40af',
    border: 'none',
    borderRadius: 6,
    padding: '11px',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxSizing: 'border-box',
    display: 'block',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'all 0.15s ease'
  },
  btnHover: {
    background: '#1d4ed8'
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#ecfdf5',
    color: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: '1rem'
  }
};

export default ForgotPasswordPage;
