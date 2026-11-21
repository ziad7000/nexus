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
  const heroSectionRef = useRef(null);
  const aiSectionRef = useRef(null);
  const jobsSectionRef = useRef(null);
  const isSnappingRef = useRef(false);

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

  const slowScrollTo = useCallback((targetY, duration = 850) => {
    if (isSnappingRef.current) return;
    isSnappingRef.current = true;

    const startY = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetY - startY;
    if (Math.abs(distance) < 5) {
      isSnappingRef.current = false;
      return;
    }

    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // easeInOutCubic easing for slow, luxurious smooth glide
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        setTimeout(() => {
          isSnappingRef.current = false;
        }, 150);
      }
    };

    requestAnimationFrame(step);
  }, []);

  const getSectionPositions = useCallback(() => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const headerOffset = 70;

    const heroTop = 0;
    const hasAI = isAuthenticated && user?.role === 'jobSeeker' && aiSectionRef.current;
    const aiTop = hasAI
      ? Math.max(0, aiSectionRef.current.getBoundingClientRect().top + scrollY - headerOffset)
      : null;
    const jobsTop = jobsSectionRef.current
      ? Math.max(0, jobsSectionRef.current.getBoundingClientRect().top + scrollY - headerOffset)
      : 0;

    return { heroTop, aiTop, jobsTop };
  }, [isAuthenticated, user?.role]);

  const scrollToNextSection = useCallback(() => {
    const { aiTop, jobsTop } = getSectionPositions();
    if (aiTop !== null) {
      slowScrollTo(aiTop, 850);
    } else {
      slowScrollTo(jobsTop, 850);
    }
  }, [getSectionPositions, slowScrollTo]);

  const scrollToJobsDirectly = useCallback(() => {
    const { jobsTop } = getSectionPositions();
    slowScrollTo(jobsTop, 850);
  }, [getSectionPositions, slowScrollTo]);

  const scrollToJobs = scrollToNextSection;

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

  useEffect(() => {
    let lastWheelTime = 0;

    const handleWheel = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const { heroTop, aiTop, jobsTop } = getSectionPositions();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (isSnappingRef.current) {
        e.preventDefault();
        return;
      }

      if (Math.abs(e.deltaY) < 18) return;

      const now = Date.now();
      if (now - lastWheelTime < 100) return;
      lastWheelTime = now;

      // Section 0 (Hero): scroll down snaps to AI section (if job seeker) or All Jobs
      if (scrollY < 60) {
        if (e.deltaY > 0) {
          e.preventDefault();
          if (aiTop !== null) {
            slowScrollTo(aiTop, 850);
          } else {
            slowScrollTo(jobsTop, 850);
          }
        }
        return;
      }

      // Section 1 (AI Recommendations):
      if (aiTop !== null && Math.abs(scrollY - aiTop) < 90) {
        if (e.deltaY > 0) {
          e.preventDefault();
          slowScrollTo(jobsTop, 850);
        } else if (e.deltaY < 0) {
          e.preventDefault();
          slowScrollTo(heroTop, 850);
        }
        return;
      }

      // Section 2 (All Jobs Section):
      if (scrollY <= jobsTop + 30) {
        if (e.deltaY < 0) {
          e.preventDefault();
          if (aiTop !== null) {
            slowScrollTo(aiTop, 850);
          } else {
            slowScrollTo(heroTop, 850);
          }
          return;
        }
      }
    };

    let touchStartY = null;
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartY === null || !e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      touchStartY = null;

      if (Math.abs(diffY) < 45 || isSnappingRef.current) return;

      const { heroTop, aiTop, jobsTop } = getSectionPositions();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollY < 60 && diffY > 0) {
        if (aiTop !== null) slowScrollTo(aiTop, 850);
        else slowScrollTo(jobsTop, 850);
      } else if (aiTop !== null && Math.abs(scrollY - aiTop) < 90) {
        if (diffY > 0) slowScrollTo(jobsTop, 850);
        else slowScrollTo(heroTop, 850);
      } else if (scrollY <= jobsTop + 30 && diffY < 0) {
        if (aiTop !== null) slowScrollTo(aiTop, 850);
        else slowScrollTo(heroTop, 850);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [getSectionPositions, slowScrollTo]);

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPage(1);
    fetchJobs({ page: 1 });
    setTimeout(() => {
      scrollToJobsDirectly();
    }, 50);
  };

  const handleCategoryClick = (catId) => {
    const newCategory = catId === 'All' ? '' : catId;
    setCategory(newCategory);
    setPage(1);
    fetchJobs({ category: newCategory, page: 1 });
    setTimeout(() => {
      scrollToJobsDirectly();
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
      scrollToJobsDirectly();
    }, 50);
  };

  const hasActiveFilters = Boolean(keyword.trim() || location.trim() || type || (category && category !== 'All'));

  return (
    <div style={styles.pageWrapper}>
      {/* Corporate Header Section (Hero) */}
      <section ref={heroSectionRef} style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.heroTopRow} className="hero-top-row">
            <div style={styles.heroTextCol}>
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
            </div>

            {/* Modern Blue Magnifying Glass Graphic */}
            <div style={styles.heroGraphicCol} className="hero-graphic-col">
              <div style={styles.graphicCard}>
                <svg
                  width="150"
                  height="150"
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={styles.magnifierSvg}
                >
                  <defs>
                    <linearGradient id="lensRingGrad" x1="20" y1="20" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                    <linearGradient id="handleGrad" x1="90" y1="90" x2="145" y2="145" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="100%" stopColor="#172554" />
                    </linearGradient>
                    <radialGradient id="lensGleam" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
                      <stop offset="70%" stopColor="#eff6ff" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.65" />
                    </radialGradient>
                    <filter id="glassShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1e40af" floodOpacity="0.18" />
                    </filter>
                  </defs>

                  {/* Tech Radar Guides */}
                  <circle cx="65" cy="65" r="54" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="65" cy="65" r="42" stroke="#93c5fd" strokeWidth="1" opacity="0.4" />

                  {/* Magnifier Handle: seamlessly connected and tucked behind the lens rim */}
                  <line
                    x1="86"
                    y1="86"
                    x2="134"
                    y2="134"
                    stroke="url(#handleGrad)"
                    strokeWidth="13"
                    strokeLinecap="round"
                    filter="url(#glassShadow)"
                  />
                  {/* Subtle inner highlight along handle */}
                  <line
                    x1="94"
                    y1="91"
                    x2="128"
                    y2="125"
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Sleek connector collar at base of rim */}
                  <line
                    x1="86"
                    y1="86"
                    x2="95"
                    y2="95"
                    stroke="#3b82f6"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Glass Lens */}
                  <circle cx="65" cy="65" r="38" fill="url(#lensGleam)" />

                  {/* Lens Rim */}
                  <circle
                    cx="65"
                    cy="65"
                    r="38"
                    stroke="url(#lensRingGrad)"
                    strokeWidth="7"
                    filter="url(#glassShadow)"
                  />

                  {/* Glass Highlight Gleam */}
                  <path
                    d="M44 48 A30 30 0 0 1 78 37"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <circle cx="85" cy="42" r="2" fill="#ffffff" opacity="0.9" />
                </svg>
              </div>
            </div>
          </div>

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

          {/* Clickable Blue Down Arrow Indicator (Static Arrow, No Movement) */}
          <div style={styles.scrollIndicatorRow}>
            <button
              type="button"
              onClick={scrollToNextSection}
              onMouseEnter={() => setScrollArrowHovered(true)}
              onMouseLeave={() => setScrollArrowHovered(false)}
              style={{
                ...styles.scrollIndicatorBtn,
                ...(scrollArrowHovered ? styles.scrollIndicatorBtnHover : {})
              }}
              title="Explore Open Positions"
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
                  style={styles.staticArrow}
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
          <section ref={aiSectionRef} style={styles.aiSectionBlock}>
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

            <div style={styles.aiContinueRow}>
              <button
                type="button"
                onClick={scrollToJobsDirectly}
                style={styles.aiContinueBtn}
                title="View All Open Positions"
              >
                <span>Explore All Open Positions Below</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </button>
            </div>
          </section>
        )}


        {/* ALL POSITIONS SECTION */}
        <section ref={jobsSectionRef} style={styles.jobsSectionBlock}>
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
    minHeight: 'calc(100vh - 68px)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '2.5rem 0 2rem',
    marginBottom: '1rem',
    scrollMarginTop: '70px'
  },
  heroTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2.5rem',
    marginBottom: '1.75rem'
  },
  heroTextCol: {
    flex: '1 1 580px',
    maxWidth: '720px'
  },
  heroGraphicCol: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  graphicCard: {
    position: 'relative',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.75) 0%, rgba(219, 234, 254, 0.45) 100%)',
    border: '1px solid #bfdbfe',
    borderRadius: '20px',
    boxShadow: '0 15px 35px -10px rgba(30, 64, 175, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  magnifierSvg: {
    display: 'block'
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
    fontSize: '1.05rem',
    color: '#475569',
    lineHeight: '1.6',
    maxWidth: '750px',
    marginBottom: '1.5rem'
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
  staticArrow: {
    display: 'block'
  },
  aiSectionBlock: {
    minHeight: 'calc(100vh - 68px)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '2.5rem 0',
    scrollMarginTop: '70px',
    borderBottom: '1px solid #f1f5f9'
  },
  aiContinueRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  aiContinueBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '9999px',
    padding: '0.55rem 1.35rem',
    color: '#1e40af',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 6px rgba(30, 64, 175, 0.08)'
  },
  jobsSectionBlock: {
    minHeight: 'calc(100vh - 68px)',
    boxSizing: 'border-box',
    padding: '2.5rem 0 4rem',
    scrollMarginTop: '70px'
  },
  sectionBlock: {
    scrollMarginTop: '70px',
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
