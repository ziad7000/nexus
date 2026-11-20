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

        // Convert requirements string to array
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
                        <h1 style={{ color: '#f8fafc', fontSize: 28 }}>⏳ Account Pending Approval</h1>
                        <p style={{ color: '#93c5fd', marginTop: '0.5rem' }}>Wait for admin approval before posting jobs.</p>
                        <Link to="/recruiter/dashboard" style={{ color: '#3b82f6', textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>Back to Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.orb1} />
            <div style={styles.orb2} />

            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/recruiter/dashboard" style={styles.backBtn}>← Back to Dashboard</Link>
                    <h1 style={styles.title}>Post a New Job</h1>
                    <p style={styles.subtitle}>The AI will automatically assign a category based on your description</p>
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
                            <p style={styles.hint}>The AI will analyze this description to assign a category (Frontend, Backend, AI/ML, DevOps, Data Engineering, or Other)</p>
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
                        <div style={styles.buttons}>
                            <button
                                type="submit"
                                disabled={loading}
                                onMouseEnter={() => setSubmitHovered(true)}
                                onMouseLeave={() => setSubmitHovered(false)}
                                style={{
                                    ...styles.submitBtn,
                                    ...(submitHovered && !loading ? {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                                    } : {})
                                }}
                            >
                                {loading ? 'Creating...' : 'Post Job'}
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
    pendingBanner: { textAlign: 'center', padding: '3rem', background: '#0c1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, animation: 'slideUp 0.4s ease both' },
};

export default CreateJobPage;
