import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users?role=recruiter');
      setRecruiters(response.data.users);
    } catch (err) {
      setError('Failed to load recruiters');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (userId, newStatus) => {
    setUpdating(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setRecruiters(recruiters.map(r =>
        r._id === userId ? { ...r, status: newStatus } : r
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
      setRecruiters(recruiters.filter(r => r._id !== userId));
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
          <span style={styles.preTitle}>EMPLOYER ONBOARDING</span>
          <h1 style={styles.title}>Recruiter Verification Queue</h1>
          <p style={styles.subtitle}>Audit employer applications and manage vacancy publication authorizations</p>
        </div>

        <ErrorAlert message={error} />

        {recruiters.length === 0 ? (
          <div style={styles.emptyState}>No recruiters found in the system.</div>
        ) : (
          <div style={styles.tableCard} className="table-responsive">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Employer Representative</th>
                  <th>Contact Email</th>
                  <th>Authorization Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map(recruiter => (
                  <tr key={recruiter._id}>
                    <td style={styles.nameCell}>{recruiter.name}</td>
                    <td style={styles.emailCell}>{recruiter.email}</td>
                    <td>
                      <span style={{
                        ...styles.statusBadge,
                        background: recruiter.status === 'approved' ? '#ecfdf5' :
                                   recruiter.status === 'pending' ? '#eff6ff' : '#fef2f2',
                        border: `1px solid ${
                          recruiter.status === 'approved' ? '#a7f3d0' :
                          recruiter.status === 'pending' ? '#bfdbfe' : '#fecaca'
                        }`,
                        color: recruiter.status === 'approved' ? '#065f46' :
                               recruiter.status === 'pending' ? '#1d4ed8' : '#991b1b'
                      }}>
                        {recruiter.status === 'approved' ? 'Approved' :
                         recruiter.status === 'pending' ? 'Pending Review' : 'Rejected'}
                      </span>
                    </td>
                    <td style={styles.dateCell}>{new Date(recruiter.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={styles.actionButtons}>
                        {recruiter.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(recruiter._id, 'approved')}
                            style={styles.approveBtn}
                            disabled={updating === recruiter._id}
                          >
                            Approve
                          </button>
                        )}
                        {recruiter.status === 'approved' && (
                          <button
                            onClick={() => updateStatus(recruiter._id, 'rejected')}
                            style={styles.rejectBtn}
                            disabled={updating === recruiter._id}
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(recruiter._id)}
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
  emailCell: {
    color: '#64748b'
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: '0.75rem',
    fontWeight: '600'
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

export default AdminRecruitersPage;
