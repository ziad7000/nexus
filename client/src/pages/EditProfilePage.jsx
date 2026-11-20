import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

function EditProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saveHovered, setSaveHovered] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setName(response.data.user.name);
            setBio(response.data.user.bio || '');
            setSkills(Array.isArray(response.data.user.skills) ? response.data.user.skills.join(', ') : '');
            setProfilePicture(response.data.user.profilePicture || '');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
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
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.patch('/profile', { name, bio, skills, profilePicture });
            setSuccess('Profile updated successfully!');
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/profile" style={styles.backBtn}>← Back to Profile</Link>
                    <h1 style={styles.title}>Edit Profile Details</h1>
                    <p style={styles.subtitle}>Update your professional identity, background summary, and skill inventory</p>
                </div>
                <div style={styles.card}>
                    <ErrorAlert message={error} />
                    {success && <div style={styles.success}>{success}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                style={getInputStyle('name')}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Professional Bio</label>
                            <textarea
                                style={getTextareaStyle('bio')}
                                rows={5}
                                placeholder="Detail your technical leadership, architectural accomplishments, and production experience..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                onFocus={() => setFocusedField('bio')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <p style={styles.hint}>Our Hugging Face AI pipeline analyzes this bio to extract domain competencies automatically.</p>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Competencies & Skills (Comma-separated)</label>
                            <input
                                style={getInputStyle('skills')}
                                type="text"
                                placeholder="e.g. Distributed Systems, Kubernetes, Go, Python, React, PostgreSQL"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                onFocus={() => setFocusedField('skills')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <p style={styles.hint}>Skills directly determine your recommendation cosine similarity ranking.</p>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Profile Picture URL</label>
                            <input
                                style={getInputStyle('profilePicture')}
                                type="url"
                                placeholder="https://..."
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                                onFocus={() => setFocusedField('profilePicture')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </div>
                        <div style={styles.buttons}>
                            <button
                                type="submit"
                                disabled={saving}
                                onMouseEnter={() => setSaveHovered(true)}
                                onMouseLeave={() => setSaveHovered(false)}
                                style={{
                                    ...styles.saveBtn,
                                    ...(saveHovered && !saving ? styles.saveBtnHover : {})
                                }}
                            >
                                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                            </button>
                            <Link to="/profile" style={styles.cancelBtn}>Cancel</Link>
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
        maxWidth: 720,
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
        outline: 'none',
        fontFamily: 'inherit',
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
    saveBtn: {
        background: '#0f172a',
        color: '#ffffff',
        border: 'none',
        borderRadius: 6,
        padding: '11px 22px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
    },
    saveBtnHover: {
        background: '#1e293b'
    },
    cancelBtn: {
        background: 'transparent',
        border: '1px solid #cbd5e1',
        color: '#475569',
        borderRadius: 6,
        padding: '10px 20px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textDecoration: 'none',
        textAlign: 'center'
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

export default EditProfilePage;
