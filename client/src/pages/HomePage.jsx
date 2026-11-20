import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import CustomDropdown from '../components/CustomDropdown';
import { useInView } from '../hooks/useInView';

function SkeletonCard() {
  return (
    <div style={styles.skeletonCard} className="nexus-glass-card">
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
        <div style={styles.skeletonAvatar} />
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.skeletonLine, width: '65%', height: '16px', marginBottom: '8px' }} />
          <div style={{ ...styles.skeletonLine, width: '40%', height: '12px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div style={{ ...styles.skeletonLine, width: '80px', height: '22px', borderRadius: '6px' }} />
        <div style={{ ...styles.skeletonLine, width: '100px', height: '22px', borderRadius: '6px' }} />
        <div style={{ ...styles.skeletonLine, width: '70px', height: '22px', borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRec, setLoadingRec] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchHovered, setSearchHovered] = useState(false);

  const [bannerRef, bannerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const jobsSectionRef = useRef(null);

  const categories = [
    { id: 'All', label: 'All Categories', icon: '🌐' },
    { id: 'Backend', label: 'Backend', icon: '⚙️' },
    { id: 'Frontend', label: 'Frontend', icon: '🎨' },
    { id: 'AI/ML', label: 'AI & Machine Learning', icon: '🤖' },
    { id: 'DevOps', label: 'DevOps & Cloud', icon: '☁️' },
    { id: 'Data Engineering', label: 'Data Engineering', icon: '📊' }
  ];

  const typeOptions = [
    { value: '', label: 'All Employment Types' },
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'internship', label: 'Internship' }
  ];

  const fetchJobs = useCallback(async (overrides = {}) => {
    setLoadingJobs(true);
    try {
      const qKeyword = overrides.keyword !== undefined ? overrides.keyword : keyword;
      const qLocation = overrides.location !== undefined ? overrides.location : location;
      const qType = overrides.type !== undefined ? overrides.type : type;
      const qCategory = overrides.category !== undefined ? overrides.category : category;
      const qPage = overrides.page !== undefined ? overrides.page : page;

      const params = new URLSearchParams();
      if (qKeyword && qKeyword.trim()) params.append('keyword', qKeyword.trim());
      if (qLocation && qLocation.trim()) params.append('location', qLocation.trim());
      if (qType && qType.trim()) params.append('type', qType.trim());
      if (qCategory && qCategory !== 'All' && qCategory.trim()) params.append('category', qCategory.trim());
      params.append('page', qPage);
      params.append('limit', 9);

      const res = await api.get(`/jobs?${params.toString()}`);
      const jobList = Array.isArray(res.data?.jobs) ? res.data.jobs : [];
      setJobs(jobList);
      setTotal(res.data?.total || jobList.length);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setJobs([]);
      setTotal(0);
    } finally {
      setLoadingJobs(false);
    }
  }, [keyword, location, type, category, page]);

  const fetchRecommended = async () => {
    setLoadingRec(true);
    try {
      const res = await api.get('/jobs/recommended');
      setRecommended(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommended([]);
    } finally {
      setLoadingRec(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAuthenticated && user?.role === 'jobSeeker') {
      fetchRecommended();
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPage(1);
    fetchJobs({ page: 1 });
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryClick = (catId) => {
    const newCategory = catId === 'All' ? '' : catId;
    setCategory(newCategory);
    setPage(1);
    fetchJobs({ category: newCategory, page: 1 });
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
    fetchJobs({ type: newType, page: 1 });
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setType('');
    setCategory('');
    setPage(1);
    fetchJobs({ keyword: '', location: '', type: '', category: '', page: 1 });
  };

  const removeFilter = (key) => {
    if (key === 'keyword') {
      setKeyword('');
      setPage(1);
      fetchJobs({ keyword: '', page: 1 });
    } else if (key === 'location') {
      setLocation('');
      setPage(1);
      fetchJobs({ location: '', page: 1 });
    } else if (key === 'type') {
      setType('');
      setPage(1);
      fetchJobs({ type: '', page: 1 });
    } else if (key === 'category') {
      setCategory('');
      setPage(1);
      fetchJobs({ category: '', page: 1 });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchJobs({ page: newPage });
    if (jobsSectionRef.current) {
      jobsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasActiveFilters = Boolean(keyword.trim() || location.trim() || type || (category && category !== 'All'));

  return (
    <div style={styles.pageWrapper}>
      {/* Background Gradients */}
      <div style={styles.bgGlowTop} />

      <div style={styles.container}>
        {/* HERO SECTION */}
        <section style={styles.heroSection}>
          <div style={styles.heroBadge}>
            <span style={styles.badgeSparkle}>✦</span>
            <span>Discover Verified Tech Positions</span>
          </div>

          <h1 style={styles.heroTitle}>
            Find Roles Where You Do <br />
            <span style={styles.heroGradient}>Your Best Engineering Work</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Explore curated software, data, and machine learning opportunities.
            Accurate skill alignment, transparent vacancy tracking, and direct company connections.
          </p>

          {/* SEARCH & FILTER BAR */}
          <form onSubmit={handleSearch} style={styles.searchBar} className="nexus-glass-card">
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔍</span>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Title, technology, or keywords..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('');
                    setPage(1);
                    fetchJobs({ keyword: '', page: 1 });
                  }}
                  style={styles.clearInputIconBtn}
                  title="Clear keyword"
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.inputWrapperLocation}>
              <span style={styles.inputIcon}>📍</span>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Location or 'Remote'..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              {location && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation('');
                    setPage(1);
                    fetchJobs({ location: '', page: 1 });
                  }}
                  style={styles.clearInputIconBtn}
                  title="Clear location"
                >
                  ✕
                </button>
              )}
            </div>

            <CustomDropdown
              options={typeOptions}
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              placeholder="Employment Type"
              minWidth={190}
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
              Search Jobs
            </button>
          </form>

          {/* Category Chips */}
          <div style={styles.categoryPills}>
            {categories.map((cat) => {
              const active = (category === cat.id) || (!category && cat.id === 'All');
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={active ? styles.categoryPillActive : styles.categoryPill}
                >
                  <span style={{ marginRight: '6px' }}>{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* AI RECOMMENDED SECTION (FOR AUTHENTICATED CANDIDATES) */}
        {isAuthenticated && user?.role === 'jobSeeker' && (
          <section style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionHeading}>⚡ AI Recommended For You</h2>
                <p style={styles.sectionSub}>Personalized matches based on skills extracted from your profile</p>
              </div>
              <Link to="/profile" style={styles.syncSkillsBtn}>
                Edit Profile Skills →
              </Link>
            </div>

            {loadingRec ? (
              <div style={styles.grid}>
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recommended.length === 0 ? (
              <div style={styles.emptyCard} className="nexus-glass-card">
                <p style={styles.emptyTitle}>No AI recommendations generated yet</p>
                <p style={styles.emptySub}>Add technical skills to your profile or use AI bio extraction to receive personalized matches.</p>
                <Link to="/profile" style={styles.primaryCtaSmall}>
                  Update Profile Skills
                </Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {recommended.slice(0, 3).map((job, idx) => (
                  <JobCard key={job._id} job={job} index={idx} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* VALUE PILLARS STRIP */}
        <section style={styles.valueSection}>
          <div style={styles.valueCard} className="nexus-glass-card">
            <span style={styles.valueIcon}>💼</span>
            <h4 style={styles.valueTitle}>Direct Company Opportunities</h4>
            <p style={styles.valueDesc}>Verified positions with transparent salary bands and live vacancy capacity.</p>
          </div>

          <div style={styles.valueCard} className="nexus-glass-card">
            <span style={styles.valueIcon}>🎯</span>
            <h4 style={styles.valueTitle}>Skill-Driven Relevance</h4>
            <p style={styles.valueDesc}>Automated NLP bio extraction and zero-shot taxonomy tagging for exact candidate fits.</p>
          </div>

          <div style={styles.valueCard} className="nexus-glass-card">
            <span style={styles.valueIcon}>⚡</span>
            <h4 style={styles.valueTitle}>Guaranteed Slot Availability</h4>
            <p style={styles.valueDesc}>ACID atomic slot allocation ensures you never apply to an oversubscribed position.</p>
          </div>
        </section>

        {/* ALL POSITIONS SECTION */}
        <section ref={jobsSectionRef} style={styles.sectionBlock}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionHeading}>
                {hasActiveFilters ? 'Search Results' : 'Featured Positions'}
              </h2>
              <p style={styles.sectionSub}>
                {loadingJobs
                  ? 'Searching open listings...'
                  : hasActiveFilters
                  ? `Found ${total} ${total === 1 ? 'position' : 'positions'} matching your search criteria`
                  : `${total} active positions available`}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                style={styles.clearFiltersBtn}
              >
                Clear All Filters ✕
              </button>
            )}
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div style={styles.activeFilterChipsRow}>
              <span style={styles.activeFilterLabel}>Active filters:</span>
              {keyword.trim() && (
                <span style={styles.activeFilterChip}>
                  Keyword: "{keyword.trim()}"
                  <button onClick={() => removeFilter('keyword')} style={styles.removeChipBtn}>✕</button>
                </span>
              )}
              {location.trim() && (
                <span style={styles.activeFilterChip}>
                  Location: "{location.trim()}"
                  <button onClick={() => removeFilter('location')} style={styles.removeChipBtn}>✕</button>
                </span>
              )}
              {category && category !== 'All' && (
                <span style={styles.activeFilterChip}>
                  Category: {category}
                  <button onClick={() => removeFilter('category')} style={styles.removeChipBtn}>✕</button>
                </span>
              )}
              {type && (
                <span style={styles.activeFilterChip}>
                  Type: {typeOptions.find((o) => o.value === type)?.label || type}
                  <button onClick={() => removeFilter('type')} style={styles.removeChipBtn}>✕</button>
                </span>
              )}
            </div>
          )}

          {loadingJobs ? (
            <div style={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div style={styles.emptyCard} className="nexus-glass-card">
              <p style={styles.emptyTitle}>No positions found matching your criteria</p>
              <p style={styles.emptySub}>
                {hasActiveFilters
                  ? 'No active roles match all specified filters. Try relaxing keywords or clearing category filters.'
                  : 'There are currently no listings posted yet.'}
              </p>
              <button
                onClick={handleResetFilters}
                style={styles.primaryCtaSmall}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {jobs.map((job, idx) => (
                <JobCard key={job._id} job={job} index={idx} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > 9 && (
            <div style={styles.paginationRow}>
              <button
                style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                ← Previous
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {Math.ceil(total / 9)}
              </span>
              <button
                style={page >= Math.ceil(total / 9) ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page >= Math.ceil(total / 9)}
                onClick={() => handlePageChange(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* RECRUITER CALLOUT BANNER */}
        <section
          ref={bannerRef}
          style={{
            ...styles.recruiterBanner,
            opacity: bannerInView ? 1 : 0,
            transform: bannerInView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
          }}
          className="nexus-glass-card"
        >
          <div style={styles.recruiterContent}>
            <span style={styles.recruiterTag}>FOR EMPLOYERS & RECRUITERS</span>
            <h3 style={styles.recruiterTitle}>Looking for Exceptional Engineering Talent?</h3>
            <p style={styles.recruiterDesc}>
              Post openings with automated AI taxonomy tagging, review applications with direct skill matching, and manage candidates with zero friction.
            </p>
          </div>
          <Link
            to={isAuthenticated && user?.role === 'recruiter' ? '/recruiter/jobs/create' : '/register'}
            style={styles.recruiterBtn}
          >
            Post an Opening →
          </Link>
        </section>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: '#08090d',
    color: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: '4rem'
  },
  bgGlowTop: {
    position: 'absolute',
    top: '-250px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '1000px',
    height: '600px',
    background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.12), rgba(6, 182, 212, 0.04), transparent 70%)',
    animation: 'gentlePulse 6s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 1.5rem',
    position: 'relative',
    zIndex: 1
  },
  heroSection: {
    textAlign: 'center',
    padding: '4.5rem 1rem 3.5rem',
    maxWidth: '960px',
    margin: '0 auto'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.35rem 0.95rem',
    background: 'rgba(37, 99, 235, 0.1)',
    border: '1px solid rgba(37, 99, 235, 0.25)',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    color: '#93c5fd',
    fontWeight: '600',
    marginBottom: '1.5rem',
    animation: 'slideUp 0.6s ease both'
  },
  badgeSparkle: {
    color: '#60a5fa',
    fontSize: '0.9rem'
  },
  heroTitle: {
    fontSize: '3.4rem',
    fontWeight: '800',
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
    marginBottom: '1.25rem',
    animation: 'slideUp 0.6s ease both'
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #93c5fd 0%, #38bdf8 50%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    maxWidth: '650px',
    margin: '0 auto 2.5rem',
    animation: 'slideUp 0.6s ease 0.1s both'
  },
  searchBar: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1.75rem',
    boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.6)',
    animation: 'slideUp 0.6s ease 0.2s both'
  },
  inputWrapper: {
    flex: '2 1 240px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputWrapperLocation: {
    flex: '1.5 1 180px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    fontSize: '0.9rem',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.6rem',
    background: 'rgba(18, 22, 34, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  searchBtn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.8rem 1.75rem',
    fontSize: '0.925rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease'
  },
  categoryPills: {
    display: 'flex',
    gap: '0.65rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'slideUp 0.6s ease 0.3s both'
  },
  categoryPill: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#94a3b8',
    padding: '0.45rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.825rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  categoryPillActive: {
    background: 'rgba(37, 99, 235, 0.15)',
    border: '1px solid #3b82f6',
    color: '#ffffff',
    padding: '0.45rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 0 12px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s ease'
  },
  valueSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
    marginBottom: '4rem',
    marginTop: '1rem'
  },
  valueCard: {
    padding: '1.75rem 1.5rem',
    borderRadius: '16px'
  },
  valueIcon: {
    fontSize: '1.75rem',
    display: 'block',
    marginBottom: '0.75rem'
  },
  valueTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '0.4rem'
  },
  valueDesc: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: '1.5'
  },
  sectionBlock: {
    marginBottom: '4rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  sectionHeading: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.02em'
  },
  sectionSub: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginTop: '0.2rem'
  },
  syncSkillsBtn: {
    color: '#60a5fa',
    fontSize: '0.875rem',
    fontWeight: '600',
    textDecoration: 'none'
  },
  clearFiltersBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#94a3b8',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  clearInputIconBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    lineHeight: 1,
    transition: 'opacity 0.15s ease'
  },
  activeFilterChipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
    padding: '0.6rem 0.85rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px'
  },
  activeFilterLabel: {
    fontSize: '0.775rem',
    color: '#64748b',
    fontWeight: '500'
  },
  activeFilterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(37, 99, 235, 0.12)',
    border: '1px solid rgba(37, 99, 235, 0.3)',
    color: '#bfdbfe',
    fontSize: '0.775rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    fontWeight: '500',
    animation: 'scaleIn 0.15s ease both'
  },
  removeChipBtn: {
    background: 'transparent',
    border: 'none',
    color: '#93c5fd',
    cursor: 'pointer',
    fontSize: '0.7rem',
    padding: 0,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.25rem'
  },
  skeletonCard: {
    padding: '1.5rem',
    borderRadius: '16px'
  },
  skeletonAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.06)'
  },
  skeletonLine: {
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '4px'
  },
  emptyCard: {
    padding: '3rem 2rem',
    textAlign: 'center',
    borderRadius: '16px'
  },
  emptyTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '0.4rem'
  },
  emptySub: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginBottom: '1.5rem'
  },
  primaryCtaSmall: {
    display: 'inline-block',
    background: '#2563eb',
    color: '#fff',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1.25rem',
    marginTop: '2.5rem'
  },
  pageBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#cbd5e1',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.825rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  pageBtnDisabled: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#475569',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.825rem',
    cursor: 'not-allowed'
  },
  pageInfo: {
    color: '#64748b',
    fontSize: '0.825rem',
    fontWeight: '500'
  },
  recruiterBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2.5rem',
    borderRadius: '20px',
    marginTop: '2rem',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  recruiterContent: {
    maxWidth: '650px'
  },
  recruiterTag: {
    fontSize: '0.725rem',
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: '0.08em',
    marginBottom: '0.4rem',
    display: 'block'
  },
  recruiterTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '0.5rem',
    letterSpacing: '-0.01em'
  },
  recruiterDesc: {
    color: '#94a3b8',
    fontSize: '0.925rem',
    lineHeight: '1.6'
  },
  recruiterBtn: {
    background: '#10b981',
    color: '#ffffff',
    padding: '0.85rem 1.6rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.925rem',
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
    whiteSpace: 'nowrap'
  }
};
