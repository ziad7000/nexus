import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import CustomDropdown from '../components/CustomDropdown';

function CreateJobPage() {
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
        totalSlots: 1
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitHovered, setSubmitHovered] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

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
        setLoading(true);
        setError('');

        const requirementsArray = formData.requirements.split(',').map(r => r.trim()).filter(r => r);

        try {
            const response = await api.post('/jobs', {
                ...formData,
                requirements: requirementsArray,
                salary: formData.salary ? parseInt(formData.salary, 10) : undefined,
                totalSlots: formData.totalSlots ? parseInt(formData.totalSlots, 10) : 1
            });
            navigate(`/jobs/${response.data.job._id}`);
        } catch (err) {
            const problemDetail = err.response?.data?.detail;
            const validationErrors = err.response?.data?.invalidParams?.map(p => `${p.name}: ${p.reason}`).join(', ');
            setError(validationErrors || problemDetail || err.response?.data?.message || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    if (user?.status === 'pending') {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.pendingBanner}>
                        <h1 style={{ color: '#0f172a', fontSize: 24, fontWeight: 700 }}>⏳ Account Pending Review</h1>
                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Your recruiter profile must be approved by an administrator before publishing openings.</p>
                        <Link to="/recruiter/dashboard" style={{ color: '#1e40af', textDecoration: 'none', display: 'inline-block', marginTop: '1rem', fontWeight: 600 }}>
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Console</Link>
                    <h1 style={styles.title}>Publish New Opening</h1>
                    <p style={styles.subtitle}>Our Hugging Face AI pipeline will automatically assign domain taxonomy based on your job description</p>
                </div>

                <div style={styles.card}>
                    <ErrorAlert message={error} />
                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Position Title *</label>
                            <input
                                style={getInputStyle('title')}
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior Distributed Systems Engineer"
                                onFocus={() => setFocusedField('title')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={{ ...styles.field, flex: 1 }}>
                                <label style={styles.label}>Company / Employer *</label>
                                <input
                                    style={getInputStyle('company')}
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Corp"
                                    onFocus={() => setFocusedField('company')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                />
                            </div>

                            <div style={{ ...styles.field, flex: 1 }}>
                                <label style={styles.label}>Location / Work Mode *</label>
                                <input
                                    style={getInputStyle('location')}
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Remote (US/EU) or New York, NY"
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
                                <label style={styles.label}>Annual Compensation ($ USD)</label>
                                <input
                                    style={getInputStyle('salary')}
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 165000"
                                    onFocus={() => setFocusedField('salary')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </div>

                            <div style={{ ...styles.field, flex: 1 }}>
                                <label style={styles.label}>Total Capacity Slots *</label>
                                <input
                                    style={getInputStyle('totalSlots')}
                                    type="number"
                                    name="totalSlots"
                                    min="1"
                                    value={formData.totalSlots}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('totalSlots')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                />
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Position Description *</label>
                            <textarea
                                style={getTextareaStyle('description')}
                                name="description"
                                rows={6}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detail team mission, engineering challenges, architecture stack, and responsibilities..."
                                onFocus={() => setFocusedField('description')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                            <p style={styles.hint}>BART transformer analyzes this text to auto-categorize the role (Backend, AI/ML, etc.).</p>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Key Competencies & Requirements (Comma-separated) *</label>
                            <input
                                style={getInputStyle('requirements')}
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                placeholder="e.g. Go, Kubernetes, Kafka, Distributed Consensus, High-Throughput APIs"
                                onFocus={() => setFocusedField('requirements')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                            <p style={styles.hint}>Candidate skill match algorithms evaluate candidates against these technical keywords.</p>
                        </div>

                        <div style={styles.buttons}>
                            <button
                                type="submit"
                                disabled={loading}
                                onMouseEnter={() => setSubmitHovered(true)}
                                onMouseLeave={() => setSubmitHovered(false)}
                                style={{
                                    ...styles.submitBtn,
                                    ...(submitHovered && !loading ? styles.submitBtnHover : {})
                                }}
                            >
                                {loading ? 'Publishing...' : 'Publish Opening'}
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
    hint: {
        color: '#64748b',
        fontSize: '0.775rem',
        marginTop: 4
    },
    buttons: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginTop: '1.75rem'
    },
    submitBtn: {
        background: '#1e40af',
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
        background: '#1d4ed8'
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
    },
    pendingBanner: {
        textAlign: 'center',
        padding: '3rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12
    }
};

export default CreateJobPage;
