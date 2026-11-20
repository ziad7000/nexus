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

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      
      <div style={styles.container}>
        <h1 style={styles.title}>Browse Jobs</h1>
        
        {/* Filters */}
        <form onSubmit={handleSearch} style={styles.filters}>
          <input
            style={styles.filterInput}
            type="text"
            placeholder="Job title, company, or keyword"
            value={filters.keyword}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
          />
          <input
            style={styles.filterInput}
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
          <CustomDropdown
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Backend', label: 'Backend' },
              { value: 'Frontend', label: 'Frontend' },
              { value: 'AI/ML', label: 'AI/ML' },
              { value: 'DevOps', label: 'DevOps' },
              { value: 'Data Engineering', label: 'Data Engineering' }
            ]}
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            placeholder="All Categories"
            minWidth={170}
          />
          <CustomDropdown
            options={[
              { value: '', label: 'All Employment Types' },
              { value: 'full-time', label: 'Full Time' },
              { value: 'part-time', label: 'Part Time' },
              { value: 'internship', label: 'Internship' }
            ]}
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            placeholder="All Types"
            minWidth={170}
          />
          <button
            type="submit"
            onMouseEnter={() => setSearchHovered(true)}
            onMouseLeave={() => setSearchHovered(false)}
            style={{
              ...styles.searchBtn,
              transform: searchHovered ? 'translateY(-1px)' : 'none',
              boxShadow: searchHovered ? '0 4px 16px rgba(37, 99, 235, 0.4)' : 'none'
            }}
          >
            Search
          </button>
        </form>

        {/* Results count */}
        <div style={styles.count}>{total} jobs found</div>

        {/* Job grid */}
        {loading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No jobs found matching your criteria</p>
            <button
              onClick={() => {
                setFilters({ keyword: '', location: '', type: '', category: '' });
                setPage(1);
              }}
              onMouseEnter={() => setClearHovered(true)}
              onMouseLeave={() => setClearHovered(false)}
              style={{
                ...styles.clearBtn,
                transform: clearHovered ? 'translateY(-1px)' : 'none',
                boxShadow: clearHovered ? '0 4px 16px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map((job, idx) => (
              <JobCard key={job._id} job={job} index={idx} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{...styles.pageBtn, opacity: page === 1 ? 0.5 : 1}}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{...styles.pageBtn, opacity: page === totalPages ? 0.5 : 1}}
            >
              Next
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
    background: '#08090d',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeIn 0.3s ease'
  },
  orb1: {
    position: 'fixed',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: '#2563eb',
    filter: 'blur(120px)',
    opacity: 0.1,
    top: -100,
    left: -100,
    pointerEvents: 'none',
    animation: 'gentlePulse 6s ease-in-out infinite'
  },
  orb2: {
    position: 'fixed',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: '#1d4ed8',
    filter: 'blur(100px)',
    opacity: 0.1,
    bottom: -80,
    right: -80,
    pointerEvents: 'none',
    animation: 'gentlePulse 6s ease-in-out infinite'
  },
  container: { maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 },
  title: { color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: '2rem' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterInput: { flex: 2, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  filterSelect: { flex: 1, background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none' },
  searchBtn: {
    background: '#2563eb',
    border: 'none',
    borderRadius: 8,
    padding: '0 24px',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  count: { color: '#666', fontSize: 14, marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  emptyState: { textAlign: 'center', padding: '3rem', background: '#161616', borderRadius: 12, color: '#666' },
  clearBtn: {
    background: '#2563eb',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' },
  pageBtn: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', color: '#fff', cursor: 'pointer' },
  pageInfo: { color: '#666', fontSize: 14 },
};

export default JobListPage;
