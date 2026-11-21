import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';

function RecruiterDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applicantCounts, setApplicantCounts] = useState({});
    const [createHovered, setCreateHovered] = useState(false);
    const [emptyHovered, setEmptyHovered] = useState(false);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/jobs/my-jobs');
            setJobs(response.data.jobs);
            const counts = {};
            for (const job of response.data.jobs) {
                try {
                    const appsRes = await api.get(`/jobs/${job._id}/applicants`);
                    counts[job._id] = appsRes.data.applications.length;
                } catch (err) {
                    counts[job._id] = 0;
                }
            }
            setApplicantCounts(counts);
        } catch (err) {
            console.error('Failed to fetch jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    if (user?.status === 'pending') {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.pendingBanner}>
                        <div style={styles.pendingBadge}>⏳ VERIFICATION IN PROGRESS</div>
                        <h1 style={styles.pendingTitle}>Recruiter Account Pending Review</h1>
                        <p style={styles.pendingSub}>
                            Your employer credentials are currently under administrative review.
                            You will be empowered to publish vacancies once approved.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <span style={styles.preTitle}>HIRING MANAGEMENT</span>
                        <h1 style={styles.title}>Employer Console</h1>
                        <p style={styles.subtitle}>Manage your posted engineering vacancies, capacity allocation, and candidate pipelines</p>
                    </div>
                    <Link
                        to="/recruiter/jobs/create"
                        onMouseEnter={() => setCreateHovered(true)}
                        onMouseLeave={() => setCreateHovered(false)}
                        style={{
                            ...styles.createBtn,
                            ...(createHovered ? styles.createBtnHover : {})
                        }}
                    >
                        + Create Opening
                    </Link>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : jobs.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h3 style={styles.emptyTitle}>No Positions Published</h3>
                        <p style={styles.emptySub}>Post your team's open technical vacancies to begin receiving AI-ranked candidate submissions.</p>
                        <Link
                            to="/recruiter/jobs/create"
                            onMouseEnter={() => setEmptyHovered(true)}
                            onMouseLeave={() => setEmptyHovered(false)}
                            style={{
                                ...styles.emptyBtn,
                                ...(emptyHovered ? styles.emptyBtnHover : {})
                            }}
                        >
                            Publish Opening
                        </Link>
                    </div>
                ) : (
                    <div style={styles.jobsList}>
                        {jobs.map((job, idx) => (
                            <div
                                key={job._id}
                                style={{
                                    ...styles.jobCard,
                                    animation: 'slideUp 0.35s ease both',
                                    animationDelay: `${Math.min(idx * 0.04, 0.3)}s`
                                }}
                            >
                                <div style={styles.jobHeader}>
                                    <div>
                                        <h3 style={styles.jobTitle}>{job.title}</h3>
                                        <p style={styles.jobCompany}>{job.company}</p>
                                    </div>
                                    <div style={styles.badgeRow}>
                                        <CategoryBadge category={job.category} />
                                        <span style={job.status === 'open' ? styles.statusOpen : styles.statusClosed}>
                                            {job.status === 'open' ? 'Active' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                                <div style={styles.jobMeta}>
                                    <span style={styles.metaItem}>📍 {job.location}</span>
                                    <span style={styles.metaDivider}>•</span>
                                    <span style={styles.metaItem}>💼 {job.type}</span>
                                    <span style={styles.metaDivider}>•</span>
                                    <span style={styles.metaItem}>📊 <strong>{applicantCounts[job._id] || 0}</strong> applicants</span>
                                    <span style={styles.metaDivider}>•</span>
                                    <span style={styles.metaItem}>⚡ {job.remainingSlots ?? job.totalSlots} slots remaining</span>
                                </div>
                                <div style={styles.jobActions}>
                                    <Link to={`/recruiter/jobs/${job._id}/edit`} style={styles.editLink}>Edit Listing</Link>
                                    <Link to={`/recruiter/jobs/${job._id}/applicants`} style={styles.applicantsLink}>
                                        Review Applicants ({applicantCounts[job._id] || 0}) →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
        maxWidth: 1000,
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
    subtitle: {
        color: '#64748b',
        fontSize: '0.9rem',
        marginTop: '0.35rem',
        margin: 0
    },
    createBtn: {
        background: '#1e40af',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: 6,
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.875rem',
        transition: 'all 0.15s ease'
    },
    createBtnHover: {
        background: '#1d4ed8'
    },
    jobsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    jobCard: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.15s ease'
    },
    jobHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
    },
    jobTitle: {
        color: '#0f172a',
        fontSize: '1.15rem',
        fontWeight: '700',
        margin: '0 0 0.25rem 0'
    },
    jobCompany: {
        color: '#475569',
        fontSize: '0.875rem',
        margin: 0
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    statusOpen: {
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        color: '#065f46',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: '600'
    },
    statusClosed: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: '600'
    },
    jobMeta: {
        display: 'flex',
        gap: '0.65rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        color: '#64748b',
        fontSize: '0.825rem'
    },
    metaItem: {
        color: '#64748b'
    },
    metaDivider: {
        color: '#cbd5e1'
    },
    jobActions: {
        display: 'flex',
        gap: '1.25rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid #f1f5f9',
        alignItems: 'center'
    },
    editLink: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: '600'
    },
    applicantsLink: {
        color: '#1e40af',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: '700'
    },
    emptyState: {
        textAlign: 'center',
        padding: '3.5rem 2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        color: '#64748b'
    },
    emptyTitle: {
        fontSize: '1.2rem',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '0.5rem'
    },
    emptySub: {
        fontSize: '0.9rem',
        color: '#64748b',
        marginBottom: '1.5rem'
    },
    emptyBtn: {
        display: 'inline-block',
        background: '#1e40af',
        color: '#ffffff',
        padding: '10px 22px',
        borderRadius: 6,
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.875rem',
        transition: 'all 0.15s ease'
    },
    emptyBtnHover: {
        background: '#1d4ed8'
    },
    pendingBanner: {
        textAlign: 'center',
        padding: '3.5rem 2rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
    },
    pendingBadge: {
        display: 'inline-block',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1d4ed8',
        padding: '0.35rem 0.85rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
        marginBottom: '1rem'
    },
    pendingTitle: {
        color: '#0f172a',
        fontSize: '1.75rem',
        fontWeight: '800',
        marginBottom: '0.5rem'
    },
    pendingSub: {
        color: '#64748b',
        fontSize: '0.95rem',
        maxWidth: '520px',
        margin: '0 auto',
        lineHeight: '1.6'
    }
};

export default RecruiterDashboard;
