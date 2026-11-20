import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoDot}><span style={styles.logoText}>NX</span></div>
          <span style={styles.logoName}>Nexus</span>
        </div>
        <h1 style={styles.title}>Sign in to your account</h1>
        <p style={styles.subtitle}>Access your verified applications and career profile</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Corporate or Personal Email</label>
            <input
              style={getInputStyle('email')}
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={getInputStyle('password')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>
          <div style={styles.forgot}>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>
        <p style={styles.registerLink}>
          Don't have an account yet? <Link to="/register" style={styles.link}>Create Account</Link>
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
    padding: '2.5rem 1.5rem',
    position: 'relative'
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: '1.75rem'
  },
  logoDot: {
    width: 32,
    height: 32,
    background: '#0f172a',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 800,
    fontSize: 13
  },
  logoName: {
    color: '#0f172a',
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: '0.04em'
  },
  title: {
    color: '#0f172a',
    fontSize: '1.45rem',
    fontWeight: '700',
    marginBottom: '0.35rem',
    letterSpacing: '-0.01em'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginBottom: '1.75rem'
  },
  field: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    color: '#475569',
    fontSize: '0.725rem',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.03em',
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
  forgot: {
    textAlign: 'right',
    marginTop: -2,
    marginBottom: '1rem'
  },
  forgotLink: {
    color: '#1e40af',
    fontSize: '0.8rem',
    fontWeight: '500',
    textDecoration: 'none'
  },
  btn: {
    width: '100%',
    background: '#0f172a',
    border: 'none',
    borderRadius: 6,
    padding: '11px',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.25rem',
    transition: 'all 0.15s ease'
  },
  btnHover: {
    background: '#1e293b',
    transform: 'translateY(-1px)'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '1.5rem 0'
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#f1f5f9'
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: 12
  },
  registerLink: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.85rem'
  },
  link: {
    color: '#1e40af',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default LoginPage;
