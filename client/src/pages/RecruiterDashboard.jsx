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
            // Fetch applicant counts for each job
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
                        <h1 style={styles.title}>⏳ Account Pending Approval</h1>
                        <p style={{ color: '#93c5fd', marginTop: '0.5rem' }}>Your recruiter account is waiting for admin approval.</p>
                        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>You'll be able to post jobs once approved.</p>
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
                    <h1 style={styles.title}>Recruiter Dashboard</h1>
                    <Link
                        to="/recruiter/jobs/create"
                        onMouseEnter={() => setCreateHovered(true)}
                        onMouseLeave={() => setCreateHovered(false)}
                        style={{
                            ...styles.createBtn,
                            ...(createHovered ? {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                            } : {})
                        }}
                    >
                        + Post New Job
                    </Link>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : jobs.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={{ color: '#94a3b8' }}>You haven't posted any jobs yet.</p>
                        <Link
                            to="/recruiter/jobs/create"
                            onMouseEnter={() => setEmptyHovered(true)}
                            onMouseLeave={() => setEmptyHovered(false)}
                            style={{
                                ...styles.emptyBtn,
                                ...(emptyHovered ? {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)'
                                } : {})
                            }}
                        >
                            Post Your First Job
                        </Link>
                    </div>
                ) : (
                    <div style={styles.jobsList}>
                        {jobs.map((job, idx) => (
                            <div
                                key={job._id}
                                style={{
                                    ...styles.jobCard,
                                    animation: 'slideUp 0.4s ease both',
                                    animationDelay: `${Math.min(idx * 0.05, 0.4)}s`
                                }}
                            >
                                <div style={styles.jobHeader}>
                                    <div>
                                        <h3 style={styles.jobTitle}>{job.title}</h3>
                                        <p style={styles.jobCompany}>{job.company}</p>
                                    </div>
                                    <CategoryBadge category={job.category} />
                                </div>
                                <div style={styles.jobMeta}>
                                    <span>📍 {job.location}</span>
                                    <span>💼 {job.type}</span>
                                    <span>📊 {applicantCounts[job._id] || 0} applicants</span>
                                    <span style={job.status === 'open' ? styles.open : styles.closed}>
                                        {job.status}
                                    </span>
                                </div>
                                <div style={styles.jobActions}>
                                    <Link to={`/recruiter/jobs/${job._id}/edit`} style={styles.editLink}>Edit</Link>
                                    <Link to={`/recruiter/jobs/${job._id}/applicants`} style={styles.applicantsLink}>View Applicants</Link>
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
    page: { minHeight: '100vh', background: '#08090d', padding: '2rem', position: 'relative', overflow: 'hidden' },
    orb1: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#2563eb', filter: 'blur(120px)', opacity: 0.1, top: -100, left: -100, pointerEvents: 'none', animation: 'gentlePulse 6s ease-in-out infinite' },
    orb2: { position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: '#1d4ed8', filter: 'blur(100px)', opacity: 0.1, bottom: -80, right: -80, pointerEvents: 'none', animation: 'gentlePulse 6s ease-in-out infinite' },
    container: { maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title: { color: '#fff', fontSize: 32, fontWeight: 800 },
    createBtn: { background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14, transition: 'transform 0.15s ease, box-shadow 0.15s ease' },
    jobsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    jobCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 16, padding: '1.5rem', transition: 'border-color 0.2s ease' },
    jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' },
    jobTitle: { color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 4 },
    jobCompany: { color: '#888', fontSize: 13 },
    jobMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', color: '#666', fontSize: 13 },
    open: { color: '#4ade80', fontWeight: 600 },
    closed: { color: '#f87171', fontWeight: 600 },
    jobActions: { display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '0.5px solid #2a2a2a' },
    editLink: { color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 500 },
    applicantsLink: { color: '#60a5fa', textDecoration: 'none', fontSize: 13, fontWeight: 500 },
    emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12 },
    emptyBtn: { display: 'inline-block', background: '#2563eb', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', marginTop: '1rem', fontWeight: 600, fontSize: 14, transition: 'transform 0.15s ease, box-shadow 0.15s ease' },
    pendingBanner: { textAlign: 'center', padding: '3rem', background: '#0c1a2e', border: '0.5px solid #1e3a5f', borderRadius: 16, animation: 'slideUp 0.4s ease both' },
};

export default RecruiterDashboard;
