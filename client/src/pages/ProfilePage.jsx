import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import SkillChip from '../components/SkillChip';

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [extractError, setExtractError] = useState('');
    const [editBtnHovered, setEditBtnHovered] = useState(false);
    const [avatarHovered, setAvatarHovered] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.user);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleExtractSkills = async () => {
        setExtracting(true);
        setExtractError('');
        try {
            const response = await api.post('/profile/extract-skills');
            setProfile({ ...profile, skills: response.data.skills });
        } catch (err) {
            setExtractError(err.response?.data?.detail || err.response?.data?.message || 'Failed to extract skills');
        } finally {
            setExtracting(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!profile) return <ErrorAlert message={error} />;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <span style={styles.preTitle}>CANDIDATE DOSSIER</span>
                        <h1 style={styles.title}>Professional Profile</h1>
                    </div>
                    <div style={styles.actions}>
                        <Link
                            to="/profile/edit"
                            onMouseEnter={() => setEditBtnHovered(true)}
                            onMouseLeave={() => setEditBtnHovered(false)}
                            style={{
                                ...styles.editBtn,
                                ...(editBtnHovered ? styles.editBtnHover : {})
                            }}
                        >
                            Edit Profile
                        </Link>
                        <Link to="/profile/change-password" style={styles.passwordBtn}>Update Password</Link>
                    </div>
                </div>

                {/* Identity Card */}
                <div style={styles.card}>
                    <div style={styles.profileRow}>
                        <div
                            onMouseEnter={() => setAvatarHovered(true)}
                            onMouseLeave={() => setAvatarHovered(false)}
                            style={{
                                ...styles.avatar,
                                transform: avatarHovered ? 'scale(1.03)' : 'none'
                            }}
                        >
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt="Profile" style={{ width: 68, height: 68, borderRadius: 34, objectFit: 'cover' }} />
                            ) : (
                                profile.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div style={styles.info}>
                            <h2 style={styles.name}>{profile.name}</h2>
                            <p style={styles.email}>{profile.email}</p>
                            <div style={styles.roleWrap}>
                                <span style={styles.roleLabel}>Role:</span>
                                <span style={styles.roleBadge}>{profile.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bio Card */}
                <div style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <h3 style={styles.sectionTitle}>Professional Bio & Background</h3>
                        <Link to="/profile/edit" style={styles.editLink}>Edit Bio</Link>
                    </div>
                    <p style={styles.bio}>{profile.bio || 'No bio documented yet. Document your engineering stack and leadership scope in Edit Profile.'}</p>
                </div>

                {/* Skills Card */}
                <div style={styles.card}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <h3 style={styles.sectionTitle}>Technical Competencies & Skills</h3>
                            <p style={styles.sectionSub}>Used to compute cosine similarity against job requirement embeddings</p>
                        </div>
                        <button
                            onClick={handleExtractSkills}
                            style={styles.extractBtn}
                            disabled={extracting}
                        >
                            {extracting ? 'Processing with Hugging Face...' : '⚡ Extract Skills with AI'}
                        </button>
                    </div>
                    {extractError && <ErrorAlert message={extractError} />}
                    <div style={styles.skillsContainer}>
                        {profile.skills?.length > 0 ? (
                            profile.skills.map((skill, i) => (
                                <SkillChip key={i} skill={skill} index={i} />
                            ))
                        ) : (
                            <p style={styles.noSkills}>No skills indexed yet. Enter skills in Edit Profile or click Extract Skills from Bio.</p>
                        )}
                    </div>
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    preTitle: {
        fontSize: '0.725rem',
        fontWeight: '700',
        color: '#1e40af',
        letterSpacing: '0.08em',
        marginBottom: '0.25rem',
        display: 'block'
    },
    title: {
        color: '#0f172a',
        fontSize: '2rem',
        fontWeight: '800',
        letterSpacing: '-0.02em',
        margin: 0
    },
    actions: {
        display: 'flex',
        gap: '0.75rem'
    },
    editBtn: {
        background: '#0f172a',
        color: '#ffffff',
        padding: '8px 18px',
        borderRadius: 6,
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.15s ease'
    },
    editBtnHover: {
        background: '#1e293b'
    },
    passwordBtn: {
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        color: '#475569',
        padding: '8px 18px',
        borderRadius: 6,
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: '600'
    },
    card: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '1.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
    },
    profileRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
    },
    avatar: {
        width: 68,
        height: 68,
        background: '#0f172a',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        fontWeight: 700,
        color: '#ffffff',
        transition: 'transform 0.2s ease',
        flexShrink: 0
    },
    info: {
        display: 'flex',
        flexDirection: 'column'
    },
    name: {
        color: '#0f172a',
        fontSize: '1.35rem',
        fontWeight: '700',
        margin: '0 0 0.25rem 0'
    },
    email: {
        color: '#64748b',
        fontSize: '0.9rem',
        margin: '0 0 0.5rem 0'
    },
    roleWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem'
    },
    roleLabel: {
        color: '#64748b',
        fontSize: '0.75rem',
        fontWeight: '600'
    },
    roleBadge: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#1d4ed8',
        textTransform: 'capitalize'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
    },
    sectionTitle: {
        color: '#0f172a',
        fontSize: '1.05rem',
        fontWeight: '700',
        margin: 0
    },
    sectionSub: {
        color: '#64748b',
        fontSize: '0.8rem',
        marginTop: '0.2rem',
        margin: 0
    },
    editLink: {
        color: '#1e40af',
        fontSize: '0.825rem',
        fontWeight: '600',
        textDecoration: 'none'
    },
    bio: {
        color: '#334155',
        fontSize: '0.9rem',
        lineHeight: '1.65',
        margin: 0
    },
    extractBtn: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1d4ed8',
        padding: '7px 14px',
        borderRadius: 6,
        fontSize: '0.8rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
    },
    skillsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: '0.5rem'
    },
    noSkills: {
        color: '#64748b',
        fontSize: '0.85rem',
        margin: 0
    }
};

export default ProfilePage;
