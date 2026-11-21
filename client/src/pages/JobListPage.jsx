import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomDropdown from '../components/CustomDropdown';
import api from '../services/api';

function JobListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [searchHovered, setSearchHovered] = useState(false);
  const [clearHovered, setClearHovered] = useState(false);
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
  });

  const [inputKeywords, setInputKeywords] = useState(searchParams.get('keyword') || '');
  const [inputLocation, setInputLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keyword && filters.keyword.trim()) params.append('keyword', filters.keyword.trim());
      if (filters.location && filters.location.trim()) params.append('location', filters.location.trim());
      if (filters.type && filters.type.trim()) params.append('type', filters.type.trim());
      if (filters.category && filters.category.trim() && filters.category !== 'All') params.append('category', filters.category.trim());
      params.append('page', page);
      params.append('limit', 12);
      
      const response = await api.get(`/jobs?${params}`);
      const jobList = Array.isArray(response.data?.jobs) ? response.data.jobs : [];
      setJobs(jobList);
      setTotal(response.data?.total || jobList.length);
      
      // Update URL
      const cleanParams = {};
      if (filters.keyword) cleanParams.keyword = filters.keyword;
      if (filters.location) cleanParams.location = filters.location;
      if (filters.type) cleanParams.type = filters.type;
      if (filters.category && filters.category !== 'All') cleanParams.category = filters.category;
      if (page > 1) cleanParams.page = page;
      setSearchParams(cleanParams);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      keyword: inputKeywords,
      location: inputLocation
    }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setInputKeywords('');
    setInputLocation('');
    setFilters({ keyword: '', location: '', type: '', category: '' });
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.preTitle}>CAREER DIRECTORY</div>
            <h1 style={styles.title}>Explore Verified Positions</h1>
            <p style={styles.subtitle}>Direct employer listings with verified salary bands and active capacity tracking</p>
          </div>
        </div>
        
        {/* Filters Toolbar */}
        <form onSubmit={handleSearch} style={styles.filtersCard}>
          <div style={styles.inputGroup}>
            <span style={styles.inputLabel}>Keywords</span>
            <input
              style={styles.filterInput}
              type="text"
              placeholder="Title, skill, or company"
              value={inputKeywords}
              onChange={(e) => setInputKeywords(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.inputLabel}>Location</span>
            <input
              style={styles.filterInput}
              type="text"
              placeholder="City, State, or Remote"
              value={inputLocation}
              onChange={(e) => setInputLocation(e.target.value)}
            />
          </div>

          <div style={styles.dropdownGroup}>
            <span style={styles.inputLabel}>Category</span>
            <CustomDropdown
              options={[
                { value: '', label: 'All Categories' },
                { value: 'Backend', label: 'Backend' },
                { value: 'Frontend', label: 'Frontend' },
                { value: 'AI/ML', label: 'AI/ML' },
                { value: 'DevOps', label: 'DevOps' },
                { value: 'Data Engineering', label: 'Data Engineering' },
                { value: 'Other', label: 'Other' },
              ]}
              value={filters.category}
              onChange={(e) => handleDropdownChange('category', e.target.value)}
              placeholder="All Categories"
              minWidth={170}
            />
          </div>

          <div style={styles.dropdownGroup}>
            <span style={styles.inputLabel}>Type</span>
            <CustomDropdown
              options={[
                { value: '', label: 'All Types' },
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'internship', label: 'Internship' },
              ]}
              value={filters.type}
              onChange={(e) => handleDropdownChange('type', e.target.value)}
              placeholder="All Types"
              minWidth={140}
            />
          </div>

          <button
            type="submit"
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            style={{
              ...styles.searchBtn,
              ...(searchHovered ? styles.searchBtnHover : {})
            }}
          >
            Apply Filters
          </button>
        </form>

        {/* Count & Status */}
        <div style={styles.countRow}>
          <span style={styles.countText}>
            Showing <strong style={{ color: '#0f172a' }}>{jobs.length}</strong> of <strong style={{ color: '#0f172a' }}>{total}</strong> active positions
          </span>
          {(filters.keyword || filters.location || filters.category || filters.type) && (
            <button
              onClick={handleResetFilters}
              style={styles.clearFiltersLink}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Job Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.emptyTitle}>No matching positions found</h3>
            <p style={styles.emptySubtitle}>Try adjusting or resetting your search filters to see all available roles.</p>
            <button
              onClick={handleResetFilters}
              onMouseEnter={() => setClearHovered(true)}
              onMouseLeave={() => setClearHovered(false)}
              style={{
                ...styles.clearBtn,
                ...(clearHovered ? styles.clearBtnHover : {})
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map((job, index) => (
              <JobCard key={job._id} job={job} index={index} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                ...styles.pageBtn,
                ...(page === 1 ? styles.pageBtnDisabled : {})
              }}
            >
              ← Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                ...styles.pageBtn,
                ...(page === totalPages ? styles.pageBtnDisabled : {})
              }}
            >
              Next →
            </button>
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
    maxWidth: 1200,
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  },
  header: {
    marginBottom: '2rem'
  },
  preTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: '0.08em',
    marginBottom: '0.35rem'
  },
  title: {
    color: '#0f172a',
    fontSize: '2.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    margin: 0
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginTop: '0.4rem',
    margin: 0
  },
  filtersCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '1.25rem',
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
  },
  inputGroup: {
    flex: '2 1 180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dropdownGroup: {
    flex: '1 1 150px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  inputLabel: {
    fontSize: '0.725rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.04em'
  },
  filterInput: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '10px 12px',
    color: '#0f172a',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%'
  },
  searchBtn: {
    background: '#1e40af',
    border: 'none',
    borderRadius: 6,
    padding: '10px 22px',
    color: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    height: '40px',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  searchBtnHover: {
    background: '#1d4ed8',
    transform: 'translateY(-1px)'
  },
  countRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem'
  },
  countText: {
    color: '#64748b',
    fontSize: '0.875rem'
  },
  clearFiltersLink: {
    background: 'none',
    border: 'none',
    color: '#1e40af',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.25rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3.5rem 2rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    color: '#64748b'
  },
  emptyTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem'
  },
  emptySubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '1.5rem'
  },
  clearBtn: {
    background: '#1e40af',
    border: 'none',
    borderRadius: 6,
    padding: '10px 20px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.15s ease'
  },
  clearBtnHover: {
    background: '#1d4ed8'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2.5rem'
  },
  pageBtn: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '8px 16px',
    color: '#0f172a',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  pageBtnDisabled: {
    background: '#f1f5f9',
    color: '#94a3b8',
    borderColor: '#e2e8f0',
    cursor: 'not-allowed'
  },
  pageInfo: {
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '500'
  }
};

export default JobListPage;
