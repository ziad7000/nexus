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
          <div style={styles.successIcon}>📧</div>
          <h1 style={styles.title}>Check your email</h1>
          <p style={styles.subtitle}>We've sent a link to <strong>{email}</strong></p>
          <Link
            to="/login"
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              ...styles.btn,
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none',
              ...(btnHovered ? {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
              } : {})
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Forgot password?</h1>
        <p style={styles.subtitle}>Enter your email to receive a reset link</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
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
              ...(btnHovered && !loading ? {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
              } : {})
            }}
          >
            {loading ? <LoadingSpinner /> : 'Send Reset Link'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#08090d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem' },
  card: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400, animation: 'scaleIn 0.4s ease both' },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: '2rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', color: '#999', fontSize: 12, marginBottom: 6 },
  input: {
    width: '100%',
    background: '#1e1e1e',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '12px',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  inputFocused: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'
  },
  btn: {
    width: '100%',
    background: '#2563eb',
    border: 'none',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  successIcon: { fontSize: 48, textAlign: 'center', marginBottom: '1rem' }
};

export default ForgotPasswordPage;
