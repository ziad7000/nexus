import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('jobSeeker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      if (role === 'recruiter') {
        setPendingMessage(true);
      } else {
        login(response.data.token, response.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    ...styles.input,
    ...(focusedField === fieldName ? styles.inputFocused : {})
  });

  if (pendingMessage) {
    return (
      <div style={styles.page}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.card}>
          <div style={styles.logo}>
            <div style={styles.logoDot}><span style={styles.logoText}>NX</span></div>
            <span style={styles.logoName}>Nexus</span>
          </div>
          <div style={styles.pendingIcon}>⏳</div>
          <h1 style={styles.title}>Pending Approval</h1>
          <p style={styles.subtitle}>Your recruiter account has been created and is awaiting admin approval. You'll be able to log in once approved.</p>
          <Link
            to="/login"
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              ...styles.btn,
              ...(btnHovered ? {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)'
              } : {})
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoDot}><span style={styles.logoText}>NX</span></div>
          <span style={styles.logoName}>Nexus</span>
        </div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Join Nexus and find your next opportunity</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={getInputStyle('name')}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={getInputStyle('email')}
              type="email"
              placeholder="you@example.com"
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
          <div style={styles.field}>
            <label style={styles.label}>I am a</label>
            <div style={styles.roleContainer}>
              <div
                style={{ ...styles.roleOption, ...(role === 'jobSeeker' ? styles.roleActive : {}) }}
                onClick={() => setRole('jobSeeker')}
              >
                <span style={styles.roleIcon}>🎓</span>
                <span style={styles.roleLabel}>Job Seeker</span>
              </div>
              <div
                style={{ ...styles.roleOption, ...(role === 'recruiter' ? styles.roleActive : {}) }}
                onClick={() => setRole('recruiter')}
              >
                <span style={styles.roleIcon}>💼</span>
                <span style={styles.roleLabel}>Recruiter</span>
              </div>
            </div>
          </div>
          {role === 'recruiter' && (
            <div style={styles.notice}>
              Recruiter accounts require admin approval before you can post jobs.
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            style={{
              ...styles.btn,
              ...(btnHovered && !loading ? {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)'
              } : {})
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>
        <p style={styles.loginLink}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#08090d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden'
  },
  orb1: {
    position: 'fixed',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: '#2563eb',
    filter: 'blur(100px)',
    opacity: 0.12,
    top: -100,
    left: -100,
    pointerEvents: 'none',
    animation: 'gentlePulse 6s ease-in-out infinite'
  },
  orb2: {
    position: 'fixed',
    width: 250,
    height: 250,
    borderRadius: '50%',
    background: '#1d4ed8',
    filter: 'blur(80px)',
    opacity: 0.12,
    bottom: -80,
    right: -80,
    pointerEvents: 'none',
    animation: 'gentlePulse 6s ease-in-out infinite'
  },
  card: {
    background: '#161616',
    border: '0.5px solid #2a2a2a',
    borderRadius: 16,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
    animation: 'scaleIn 0.4s ease both'
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' },
  logoDot: { width: 32, height: 32, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: 800, fontSize: 14 },
  logoName: { color: '#fff', fontWeight: 700, fontSize: 18 },
  title: { color: '#fff', fontSize: 26, fontWeight: 800, marginBottom: 6 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: '2rem' },
  notice: {
    background: '#0c1a2e',
    border: '0.5px solid #1e3a5f',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#93c5fd',
    fontSize: 13,
    marginBottom: '1rem'
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', color: '#999', fontSize: 12, fontWeight: 500, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: {
    width: '100%',
    background: '#1e1e1e',
    border: '0.5px solid #2a2a2a',
    borderRadius: 8,
    padding: '12px 14px',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box'
  },
  inputFocused: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'
  },
  roleContainer: { display: 'flex', gap: 10 },
  roleOption: {
    flex: 1,
    background: '#1e1e1e',
    border: '0.5px solid #2a2a2a',
    borderRadius: 8,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease'
  },
  roleActive: {
    border: '0.5px solid #2563eb',
    background: '#0c1a2e'
  },
  roleIcon: { fontSize: 20 },
  roleLabel: { color: '#fff', fontSize: 13, fontWeight: 500 },
  btn: {
    display: 'block',
    width: '100%',
    background: '#2563eb',
    border: 'none',
    borderRadius: 8,
    padding: 13,
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '0.5rem',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease'
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '1.25rem 0' },
  dividerLine: { flex: 1, height: 0.5, background: '#2a2a2a' },
  dividerText: { color: '#444', fontSize: 12 },
  loginLink: { textAlign: 'center', color: '#666', fontSize: 13 },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: 500 },
  pendingIcon: { fontSize: 40, marginBottom: '1rem', textAlign: 'center' }
};

export default RegisterPage;
