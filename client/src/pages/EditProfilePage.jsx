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
            <div style={styles.orb1} />
            <div style={styles.orb2} />
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/profile" style={styles.backBtn}>← Back to Profile</Link>
                    <h1 style={styles.title}>Edit Profile</h1>
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
                            <label style={styles.label}>Bio</label>
                            <textarea
                                style={getTextareaStyle('bio')}
                                rows={5}
                                placeholder="Tell us about your skills and experience..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                onFocus={() => setFocusedField('bio')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <p style={styles.hint}>Add a detailed bio then use "Extract Skills" on your profile page to auto-generate skills.</p>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Skills (Comma-separated)</label>
                            <input
                                style={getInputStyle('skills')}
                                type="text"
                                placeholder="e.g. React, Node.js, Python, Docker, AWS"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                onFocus={() => setFocusedField('skills')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <p style={styles.hint}>You can add/edit skills manually here or click "Extract Skills from Bio" on your profile.</p>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Profile Picture URL</label>
                            <input
                                style={getInputStyle('profilePicture')}
                                type="url"
                                placeholder="https://example.com/avatar.jpg"
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
                                    ...(saveHovered && !saving ? {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                                    } : {})
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
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
    page: { minHeight: '100vh', background: '#08090d', padding: '2rem', position: 'relative', overflow: 'hidden' },
    orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#2563eb', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none', animation: 'gentlePulse 6s ease-in-out infinite' },
    orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#1d4ed8', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none', animation: 'gentlePulse 6s ease-in-out infinite' },
    container: { maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1, animation: 'slideUp 0.4s ease both' },
    header: { marginBottom: '2rem' },
    backBtn: { color: '#666', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800 },
    card: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '2rem' },
    field: { marginBottom: '1.5rem' },
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
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    },
    textarea: {
        width: '100%',
        background: '#1e1e1e',
        border: '0.5px solid #2a2a2a',
        borderRadius: 8,
        padding: '12px 14px',
        color: '#fff',
        fontSize: 14,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    },
    inputFocused: {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)'
    },
    hint: { color: '#555', fontSize: 12, marginTop: 6 },
    buttons: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
    saveBtn: {
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
    cancelBtn: { background: 'transparent', border: '0.5px solid #2a2a2a', color: '#999', borderRadius: 8, padding: '12px 24px', fontSize: 14, textDecoration: 'none', textAlign: 'center' },
    success: { background: '#0a2a1a', border: '0.5px solid #1a5c35', color: '#4ade80', padding: '12px', borderRadius: 8, marginBottom: '1rem' },
};

export default EditProfilePage;
