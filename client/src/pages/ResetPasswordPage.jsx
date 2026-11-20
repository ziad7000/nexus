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
      setError(err.response?.data?.message || 'Link expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{success ? 'Success!' : 'Reset Password'}</h1>
        <p style={styles.subtitle}>{success ? 'Redirecting...' : 'Enter new password'}</p>
        <ErrorAlert message={error} />
        {!success && (
          <form onSubmit={handleSubmit}>
            <input
              style={{
                ...styles.input,
                ...(focusedField === 'password' ? styles.inputFocused : {})
              }}
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
            />
            <div style={{ margin: '10px 0' }} />
            <input
              style={{
                ...styles.input,
                ...(focusedField === 'confirm' ? styles.inputFocused : {})
              }}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                ...styles.btn,
                marginTop: '20px',
                ...(btnHovered && !loading ? {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                } : {})
              }}
            >
              {loading ? <LoadingSpinner /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#08090d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem' },
  card: { background: '#161616', border: '1px solid #2a2a2a', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 400, animation: 'scaleIn 0.4s ease both' },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  subtitle: { color: '#666', marginBottom: '2rem' },
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
  }
};

export default ResetPasswordPage;
