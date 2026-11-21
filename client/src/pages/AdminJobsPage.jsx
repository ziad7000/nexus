import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CategoryBadge from '../components/CategoryBadge';
import ErrorAlert from '../components/ErrorAlert';

function AdminJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/jobs?limit=100');
            setJobs(response.data.jobs);
        } catch (err) {
            setError('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
        setDeleting(jobId);
        try {
            await api.delete(`/jobs/${jobId}`);
            setJobs(jobs.filter(job => job._id !== jobId));
        } catch (err) {
            alert('Failed to delete job');
        } finally {
            setDeleting(null);
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/admin/dashboard" style={styles.backBtn}>← Back to Overview</Link>
                    <span style={styles.preTitle}>JOB DIRECTORY GOVERNANCE</span>
                    <h1 style={styles.title}>All Platform Openings</h1>
                    <p style={styles.subtitle}>Audit active job posts, capacity allocation, and listings across employers</p>
                </div>

                <ErrorAlert message={error} />

                {/* Filters */}
                <div style={styles.filtersBar}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterActive : {})}}
                    >
                        All Positions ({jobs.length})
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        style={{...styles.filterBtn, ...(filter === 'open' ? styles.filterActive : {})}}
                    >
                        Active ({jobs.filter(j => j.status === 'open').length})
                    </button>
                    <button
                        onClick={() => setFilter('closed')}
                        style={{...styles.filterBtn, ...(filter === 'closed' ? styles.filterActive : {})}}
                    >
                        Closed ({jobs.filter(j => j.status === 'closed').length})
                    </button>
                </div>

                {filteredJobs.length === 0 ? (
                    <div style={styles.emptyState}>No jobs match the selected filter.</div>
                ) : (
                    <div style={styles.tableCard} className="table-responsive">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Position Title</th>
                                    <th>Employer</th>
                                    <th>Domain</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredJobs.map(job => (
                                    <tr key={job._id}>
                                        <td style={styles.titleCell}>
                                            <Link to={`/jobs/${job._id}`} style={styles.jobLink}>
                                                {job.title}
                                            </Link>
                                        </td>
                                        <td style={styles.companyCell}>{job.company}</td>
                                        <td>
                                            <CategoryBadge category={job.category} />
                                        </td>
                                        <td style={styles.metaCell}>{job.location}</td>
                                        <td>
                                            <span style={{
                                                ...styles.statusBadge,
                                                background: job.status === 'open' ? '#ecfdf5' : '#fef2f2',
                                                border: `1px solid ${job.status === 'open' ? '#a7f3d0' : '#fecaca'}`,
                                                color: job.status === 'open' ? '#065f46' : '#991b1b'
                                            }}>
                                                {job.status === 'open' ? 'Active' : 'Closed'}
                                            </span>
                                        </td>
                                        <td style={styles.metaCell}>
                                            {job.remainingSlots ?? job.totalSlots} / {job.totalSlots}
                                        </td>
                                        <td>
                                            <div style={styles.actionButtons}>
                                                <Link to={`/jobs/${job._id}`} style={styles.viewBtn}>View</Link>
                                                <button
                                                    onClick={() => deleteJob(job._id)}
                                                    style={styles.deleteBtn}
                                                    disabled={deleting === job._id}
                                                >
                                                    {deleting === job._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
    },
    header: {
        marginBottom: '2rem'
    },
    backBtn: {
        color: '#64748b',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'inline-block',
        marginBottom: '0.75rem'
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
    filtersBar: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem'
    },
    filterBtn: {
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 6,
        padding: '8px 16px',
        color: '#475569',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer'
    },
    filterActive: {
        background: '#1e40af',
        borderColor: '#1e40af',
        color: '#ffffff'
    },
    tableCard: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.85rem'
    },
    titleCell: {
        fontWeight: '600',
        color: '#0f172a'
    },
    jobLink: {
        color: '#0f172a',
        textDecoration: 'none',
        fontWeight: '600'
    },
    companyCell: {
        color: '#475569',
        fontWeight: '500'
    },
    metaCell: {
        color: '#64748b'
    },
    statusBadge: {
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: '600'
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
    },
    viewBtn: {
        color: '#1e40af',
        textDecoration: 'none',
        fontSize: 12,
        fontWeight: '600'
    },
    deleteBtn: {
        background: 'transparent',
        border: '1px solid #cbd5e1',
        color: '#64748b',
        padding: '3px 8px',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        color: '#64748b'
    }
};

export default AdminJobsPage;
