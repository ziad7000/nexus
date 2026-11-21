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
      setError(err.response?.data?.message || 'Something went wrong during registration');
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
        <div style={styles.card}>
          <div style={styles.logo}>
            <div style={styles.logoDot}><span style={styles.logoText}>NX</span></div>
            <span style={styles.logoName}>Nexus</span>
          </div>
          <div style={styles.pendingBadge}>⏳ SUBMISSION RECEIVED</div>
          <h1 style={styles.title}>Account Pending Review</h1>
          <p style={styles.subtitle}>
            Your recruiter account has been registered and submitted to administration for verification.
            You will receive access to post vacancies once approved.
          </p>
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
        <div style={styles.logo}>
          <div style={styles.logoDot}><span style={styles.logoText}>NX</span></div>
          <span style={styles.logoName}>Nexus</span>
        </div>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join our talent network</p>
        <ErrorAlert message={error} />
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={getInputStyle('name')}
              type="text"
              placeholder="e.g. Ziad Islam"
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
              placeholder="ziad@example.com"
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Account Type</label>
            <div style={styles.roleContainer}>
              <div
                style={{ ...styles.roleOption, ...(role === 'jobSeeker' ? styles.roleActive : {}) }}
                onClick={() => setRole('jobSeeker')}
              >
                <span style={styles.roleLabel}>Job Seeker</span>
              </div>
              <div
                style={{ ...styles.roleOption, ...(role === 'recruiter' ? styles.roleActive : {}) }}
                onClick={() => setRole('recruiter')}
              >
                <span style={styles.roleLabel}>Recruiter</span>
              </div>
            </div>
          </div>
          {role === 'recruiter' && (
            <div style={styles.notice}>
              Recruiter accounts must undergo verification by an admin before being able to post openings.
            </div>
          )}
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
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>
        <p style={styles.loginLink}>
          Already registered? <Link to="/login" style={styles.link}>Sign in</Link>
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
    maxWidth: 440,
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
    background: '#1e40af',
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
  pendingBadge: {
    display: 'inline-block',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1d4ed8',
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginBottom: '1rem'
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
    marginBottom: '1.75rem',
    lineHeight: '1.5'
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
  roleContainer: {
    display: 'flex',
    gap: '0.5rem'
  },
  roleOption: {
    flex: 1,
    padding: '0.65rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'center',
    background: '#ffffff',
    transition: 'all 0.15s ease'
  },
  roleActive: {
    borderColor: '#1e40af',
    background: '#eff6ff'
  },
  roleLabel: {
    fontSize: '0.825rem',
    fontWeight: '600',
    color: '#0f172a'
  },
  notice: {
    padding: '0.65rem 0.85rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    color: '#1e40af',
    fontSize: '0.775rem',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  btn: {
    display: 'block',
    textAlign: 'center',
    textDecoration: 'none',
    width: '100%',
    background: '#1e40af',
    border: 'none',
    borderRadius: 6,
    padding: '11px',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease'
  },
  btnHover: {
    background: '#1d4ed8',
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
  loginLink: {
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

export default RegisterPage;
