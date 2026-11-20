import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CustomDropdown from '../components/CustomDropdown';

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let url = '/admin/users?';
            if (roleFilter !== 'all') url += `role=${roleFilter}&`;
            if (statusFilter !== 'all') url += `status=${statusFilter}&`;
            const response = await api.get(url);
            setUsers(response.data.users);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (userId, newStatus) => {
        setUpdating(userId);
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(u =>
                u._id === userId ? { ...u, status: newStatus } : u
            ));
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <Link to="/admin/dashboard" style={styles.backBtn}>← Back to Overview</Link>
                    <span style={styles.preTitle}>DIRECTORY GOVERNANCE</span>
                    <h1 style={styles.title}>User Management</h1>
                    <p style={styles.subtitle}>Audit candidate and recruiter profiles, modify system roles, and revoke platform access</p>
                </div>

                <ErrorAlert message={error} />

                {/* Filters */}
                <div style={styles.filtersCard}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Filter by Role</label>
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Roles' },
                                { value: 'jobSeeker', label: 'Candidates' },
                                { value: 'recruiter', label: 'Recruiters' },
                                { value: 'admin', label: 'Admins' }
                            ]}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            minWidth={160}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Filter by Status</label>
                        <CustomDropdown
                            options={[
                                { value: 'all', label: 'All Statuses' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'rejected', label: 'Rejected' }
                            ]}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            minWidth={160}
                        />
                    </div>
                </div>

                {users.length === 0 ? (
                    <div style={styles.emptyState}>No users match the selected filters.</div>
                ) : (
                    <div style={styles.tableCard} className="table-responsive">
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td style={styles.nameCell}>
                                            <div style={styles.userCellGroup}>
                                                <div style={styles.tableAvatar}>
                                                    {u.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <span style={styles.userNameText}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={styles.emailCell}>{u.email}</td>
                                        <td>
                                            <span style={styles.roleTag}>{u.role}</span>
                                        </td>
                                        <td>
                                            <span style={{
                                                ...styles.statusBadge,
                                                background: u.status === 'approved' ? '#ecfdf5' :
                                                           u.status === 'pending' ? '#eff6ff' : '#fef2f2',
                                                border: `1px solid ${
                                                    u.status === 'approved' ? '#a7f3d0' :
                                                    u.status === 'pending' ? '#bfdbfe' : '#fecaca'
                                                }`,
                                                color: u.status === 'approved' ? '#065f46' :
                                                       u.status === 'pending' ? '#1d4ed8' : '#991b1b'
                                            }}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td style={styles.dateCell}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={styles.actionButtons}>
                                                {u.role === 'recruiter' && u.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(u._id, 'approved')}
                                                        style={styles.approveBtn}
                                                        disabled={updating === u._id}
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {u.role === 'recruiter' && u.status === 'approved' && (
                                                    <button
                                                        onClick={() => updateStatus(u._id, 'rejected')}
                                                        style={styles.rejectBtn}
                                                        disabled={updating === u._id}
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteUser(u._id)}
                                                    style={styles.deleteBtn}
                                                >
                                                    Delete
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
    filtersCard: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '1.25rem',
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    filterLabel: {
        color: '#64748b',
        fontSize: '0.725rem',
        fontWeight: '700',
        textTransform: 'uppercase'
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
    nameCell: {
        fontWeight: '600',
        color: '#0f172a'
    },
    userCellGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem'
    },
    tableAvatar: {
        width: 28,
        height: 28,
        borderRadius: 6,
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '0.75rem',
        color: '#0f172a'
    },
    userNameText: {
        color: '#0f172a',
        fontWeight: '600'
    },
    emailCell: {
        color: '#64748b'
    },
    roleTag: {
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        color: '#334155',
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    statusBadge: {
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    dateCell: {
        color: '#64748b'
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
    },
    approveBtn: {
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        color: '#065f46',
        padding: '4px 10px',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: '600'
    },
    rejectBtn: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        padding: '4px 10px',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: '600'
    },
    deleteBtn: {
        background: 'transparent',
        border: '1px solid #cbd5e1',
        color: '#64748b',
        padding: '4px 10px',
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: '500'
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

export default AdminUsersPage;
