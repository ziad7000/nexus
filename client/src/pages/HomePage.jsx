import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import JobCard from '../components/JobCard';
import CustomDropdown from '../components/CustomDropdown';
import { useInView } from '../hooks/useInView';

function SkeletonCard() {
  return (
    <div style={styles.skeletonCard}>
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
        <div style={styles.skeletonAvatar} />
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.skeletonLine, width: '60%', height: '16px', marginBottom: '8px' }} />
          <div style={{ ...styles.skeletonLine, width: '35%', height: '12px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <div style={{ ...styles.skeletonLine, width: '70px', height: '20px', borderRadius: '4px' }} />
        <div style={{ ...styles.skeletonLine, width: '90px', height: '20px', borderRadius: '4px' }} />
        <div style={{ ...styles.skeletonLine, width: '60px', height: '20px', borderRadius: '4px' }} />
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
  const [scrollArrowHovered, setScrollArrowHovered] = useState(false);

  const [bannerRef, bannerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const jobsSectionRef = useRef(null);

  const categories = [
    { id: 'All', label: 'All Roles' },
    { id: 'Backend', label: 'Backend' },
    { id: 'Frontend', label: 'Frontend' },
    { id: 'AI/ML', label: 'AI & Machine Learning' },
    { id: 'DevOps', label: 'DevOps & Infrastructure' },
    { id: 'Data Engineering', label: 'Data Engineering' }
  ];

  const typeOptions = [
    { value: '', label: 'All Employment Types' },
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'internship', label: 'Internship' }
  ];

  const scrollToJobs = () => {
    if (jobsSectionRef.current) {
      const headerOffset = 90;
      const elementPosition = jobsSectionRef.current.getBoundingClientRect().top;
      const targetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });
    }
  };

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
    setTimeout(() => {
      scrollToJobs();
    }, 50);
  };

  const handleCategoryClick = (catId) => {
    const newCategory = catId === 'All' ? '' : catId;
    setCategory(newCategory);
    setPage(1);
    fetchJobs({ category: newCategory, page: 1 });
    setTimeout(() => {
      scrollToJobs();
    }, 50);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
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
    setTimeout(() => {
      scrollToJobs();
    }, 50);
  };

  const hasActiveFilters = Boolean(keyword.trim() || location.trim() || type || (category && category !== 'All'));

  return (
    <div style={styles.pageWrapper}>
      {/* Corporate Header Section */}
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.heroBadge}>
            <span style={styles.badgeDot}></span>
            <span>ENTERPRISE CAREER PLATFORM • VERIFIED OPPORTUNITIES</span>
          </div>

          <h1 style={styles.heroTitle}>
            Connecting you to your <br />
            next <span style={{ color: '#1e40af' }}>career opportunity</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Direct company openings with transparent job posts, get automatically
            AI-matched to jobs by your skills powered by Hugging Face AI.
          </p>

          {/* Search Console Card */}
          <form onSubmit={handleSearch} style={styles.searchConsole}>
            <div style={styles.searchFieldsGroup}>
              <div style={styles.inputWrapper}>
                <span style={styles.inputLabel}>Role or Technology</span>
                <input
                  style={styles.searchInput}
                  type="text"
                  placeholder="e.g. Backend, Python, Machine Learning"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div style={styles.inputDivider} />

              <div style={styles.inputWrapper}>
                <span style={styles.inputLabel}>Location</span>
                <input
                  style={styles.searchInput}
                  type="text"
                  placeholder="e.g. New York, Cairo, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div style={styles.inputDivider} />

              <div style={styles.dropdownWrapper}>
                <span style={styles.inputLabel}>Employment Type</span>
                <CustomDropdown
                  options={typeOptions}
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  placeholder="All Types"
                  variant="search"
                  minWidth={160}
                />
              </div>
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
              Search Openings
            </button>
          </form>

          {/* Category Tabs */}
          <div style={styles.categoryPills}>
            {categories.map((cat) => {
              const active = (category === cat.id) || (!category && cat.id === 'All');
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  style={active ? styles.categoryPillActive : styles.categoryPill}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Clickable Blue Down Arrow Indicator */}
          <div style={styles.scrollIndicatorRow}>
            <button
              type="button"
              onClick={scrollToJobs}
              onMouseEnter={() => setScrollArrowHovered(true)}
              onMouseLeave={() => setScrollArrowHovered(false)}
              style={{
                ...styles.scrollIndicatorBtn,
                ...(scrollArrowHovered ? styles.scrollIndicatorBtnHover : {})
              }}
              title="View Open Positions"
              aria-label="Scroll down to open positions"
            >
              <span style={styles.scrollIndicatorLabel}>Explore Open Positions</span>
              <div style={styles.scrollArrowIconWrap}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={styles.bouncingArrow}
                >
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </div>
            </button>
          </div>

        </div>
      </section>

      <div style={styles.container}>
        {/* AI RECOMMENDED SECTION (FOR AUTHENTICATED CANDIDATES) */}
        {isAuthenticated && user?.role === 'jobSeeker' && (
          <section style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <div>
                <div style={styles.sectionPre}>AI RECOMMENDATIONS</div>
                <h2 style={styles.sectionHeading}>Matched to Your Skills</h2>
                <p style={styles.sectionSub}>Based on your profile skills, matched by AI</p>
              </div>
              <Link to="/profile" style={styles.syncSkillsBtn}>
                Update Profile Skills →
              </Link>
            </div>

            {loadingRec ? (
              <div style={styles.grid}>
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : recommended.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyTitle}>No personalized recommendations generated yet</p>
                <p style={styles.emptySub}>Add technical skills to your profile or use AI bio extraction to receive high-precision matches.</p>
                <Link to="/profile" style={styles.primaryCtaSmall}>
                  Manage Profile Skills
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


        {/* ALL POSITIONS SECTION */}
        <section ref={jobsSectionRef} style={styles.sectionBlock}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionPre}>JOB POSITIONS</div>
              <h2 style={styles.sectionHeading}>
                {hasActiveFilters ? 'Filtered Search Results' : 'All Open Positions'}
              </h2>
              <p style={styles.sectionSub}>
                {loadingJobs
                  ? 'Querying active database records...'
                  : hasActiveFilters
                  ? `Found ${total} ${total === 1 ? 'position' : 'positions'} matching your search criteria`
                  : `${total} verified open positions available`}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                style={styles.clearFiltersBtn}
              >
                Reset Filters ✕
              </button>
            )}
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div style={styles.activeFilterChipsRow}>
              <span style={styles.activeFilterLabel}>Applied filters:</span>
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
                  Domain: {category}
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
            <div style={styles.emptyCard}>
              <p style={styles.emptyTitle}>No positions match your criteria</p>
              <p style={styles.emptySub}>
                {hasActiveFilters
                  ? 'No active roles match all specified filters. Try relaxing keywords or clearing category constraints.'
                  : 'There are currently no listings posted yet.'}
              </p>
              <button
                onClick={handleResetFilters}
                style={styles.primaryCtaSmall}
              >
                Reset All Filters
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
            transform: bannerInView ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease'
          }}
        >
          <div style={styles.recruiterContent}>
            <span style={styles.recruiterTag}>FOR HIRING MANAGERS & RECRUITERS</span>
            <h3 style={styles.recruiterTitle}>Looking for talent?</h3>
            <p style={styles.recruiterDesc}>
              Post job openings with automated AI tagging, review applications with direct skill matching, and manage candidates through an executive dashboard.
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
    background: '#f8fafc',
    color: '#0f172a',
    position: 'relative',
    paddingBottom: '5rem'
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 1.5rem',
    position: 'relative'
  },
  heroSection: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '4rem 0 3.5rem',
    marginBottom: '3rem'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.85rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.725rem',
    color: '#334155',
    fontWeight: '700',
    letterSpacing: '0.05em',
    marginBottom: '1.25rem'
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#1e40af'
  },
  heroTitle: {
    fontSize: '2.85rem',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.025em',
    color: '#0f172a',
    marginBottom: '1rem',
    maxWidth: '900px'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#475569',
    lineHeight: '1.6',
    maxWidth: '750px',
    marginBottom: '2.25rem'
  },
  searchConsole: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.75rem'
  },
  searchFieldsGroup: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 650px',
    flexWrap: 'wrap'
  },
  inputWrapper: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.4rem 0.85rem'
  },
  dropdownWrapper: {
    flex: '1 1 180px',
    display: 'flex',
    flexDirection: 'column',
    padding: '0.4rem 0.85rem'
  },
  inputLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginBottom: '2px'
  },
  inputDivider: {
    width: '1px',
    height: '36px',
    background: '#e2e8f0'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '0.9rem',
    color: '#0f172a',
    fontWeight: '500',
    background: 'transparent',
    padding: '4px 0'
  },
  searchBtn: {
    background: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '7px',
    padding: '0.85rem 1.6rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap'
  },
  searchBtnHover: {
    background: '#1d4ed8',
    transform: 'translateY(-1px)'
  },
  categoryPills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    justifyContent: 'center'
  },
  categoryPill: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#475569',
    padding: '0.45rem 0.95rem',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  categoryPillActive: {
    background: '#1e40af',
    border: '1px solid #1e40af',
    color: '#ffffff',
    padding: '0.45rem 0.95rem',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  scrollIndicatorRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.75rem',
    paddingTop: '0.5rem'
  },
  scrollIndicatorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '9999px',
    padding: '0.5rem 1.15rem 0.5rem 1.25rem',
    color: '#1e40af',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(30, 64, 175, 0.08)'
  },
  scrollIndicatorBtnHover: {
    background: '#dbeafe',
    borderColor: '#93c5fd',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)'
  },
  scrollIndicatorLabel: {
    letterSpacing: '-0.01em'
  },
  scrollArrowIconWrap: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(30, 64, 175, 0.12)'
  },
  bouncingArrow: {
    animation: 'floatDown 1.8s ease-in-out infinite'
  },
  statsStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    paddingTop: '1.75rem',
    borderTop: '1px solid #f1f5f9',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  statNumber: {
    color: '#0f172a',
    fontSize: '1.25rem',
    fontWeight: '800',
    lineHeight: '1.1'
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: '#e2e8f0'
  },
  sectionBlock: {
    scrollMarginTop: '95px',
    marginBottom: '3.5rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  sectionPre: {
    fontSize: '0.725rem',
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: '0.08em',
    marginBottom: '0.25rem'
  },
  sectionHeading: {
    fontSize: '1.65rem',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    margin: 0
  },
  sectionSub: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '0.25rem',
    margin: 0
  },
  syncSkillsBtn: {
    color: '#1e40af',
    fontSize: '0.875rem',
    fontWeight: '600',
    textDecoration: 'none'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.25rem'
  },
  valueSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3.5rem'
  },
  valueCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.75rem',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
  },
  valueBadge: {
    fontSize: '0.675rem',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: '#1e40af',
    marginBottom: '0.65rem'
  },
  valueTitle: {
    color: '#0f172a',
    fontSize: '1.05rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    margin: 0
  },
  valueDesc: {
    color: '#475569',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    marginTop: '0.5rem',
    margin: 0
  },
  emptyCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '3rem 2rem',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem'
  },
  emptySub: {
    fontSize: '0.9rem',
    color: '#64748b',
    maxWidth: '500px',
    margin: '0 auto 1.5rem'
  },
  primaryCtaSmall: {
    display: 'inline-block',
    background: '#1e40af',
    color: '#ffffff',
    padding: '0.55rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none'
  },
  clearFiltersBtn: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#334155',
    padding: '0.45rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  activeFilterChipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.25rem',
    padding: '0.75rem 1rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  activeFilterLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b'
  },
  activeFilterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '0.2rem 0.55rem',
    fontSize: '0.775rem',
    color: '#1d4ed8',
    fontWeight: '500'
  },
  removeChipBtn: {
    background: 'transparent',
    border: 'none',
    color: '#1d4ed8',
    cursor: 'pointer',
    fontSize: '0.75rem',
    padding: '0 2px'
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2.5rem'
  },
  pageBtn: {
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    color: '#0f172a',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  pageBtnDisabled: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
    cursor: 'not-allowed'
  },
  pageInfo: {
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  recruiterBanner: {
    background: '#0f172a',
    borderRadius: '12px',
    padding: '2.5rem 3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    marginTop: '2rem'
  },
  recruiterContent: {
    maxWidth: '650px'
  },
  recruiterTag: {
    color: '#93c5fd',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.08em'
  },
  recruiterTitle: {
    color: '#ffffff',
    fontSize: '1.65rem',
    fontWeight: '700',
    margin: '0.5rem 0',
    letterSpacing: '-0.01em'
  },
  recruiterDesc: {
    color: '#cbd5e1',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: 0
  },
  recruiterBtn: {
    background: '#ffffff',
    color: '#1e40af',
    padding: '0.85rem 1.6rem',
    borderRadius: '7px',
    fontWeight: '700',
    fontSize: '0.9rem',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  },
  skeletonCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem'
  },
  skeletonAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    background: '#f1f5f9'
  },
  skeletonLine: {
    background: '#f1f5f9',
    borderRadius: '4px'
  }
};
