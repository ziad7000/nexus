import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import JobCard from '../components/JobCard';

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

  const categories = ['All', 'Frontend', 'Backend', 'AI/ML', 'DevOps', 'Data Engineering'];

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (type) params.append('type', type);
      if (category && category !== 'All') params.append('category', category);
      params.append('page', page);
      params.append('limit', 9);

      const res = await api.get(`/jobs?${params}`);
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
  };

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
  }, [page, category, type]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'jobSeeker') {
      fetchRecommended();
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Background Gradients */}
      <div style={styles.bgGlowTop} />
      <div style={styles.bgGlowBottom} />

      <div style={styles.container}>
        {/* HERO SECTION */}
        <section style={styles.heroSection}>
          <div style={styles.heroBadge}>
            <span style={styles.badgeDot}></span>
            <span>ACID-Atomic Concurrency Engine • Production Live</span>
          </div>

          <h1 style={styles.heroTitle}>
            Engineering Career Matching <br />
            <span style={styles.heroGradient}>Built for Cloud Reliability</span>
          </h1>

          <p style={styles.heroSubtitle}>
            A production-hardened platform featuring atomic condition-based vacancy slot reservations,
            automated database migrations, and Hugging Face semantic vector inference.
          </p>

          <div style={styles.heroActions}>
            <a href="#jobs-section" style={styles.primaryCta}>
              Explore Opportunities ↓
            </a>
            <a
              href="https://nexus-api-ullk.onrender.com/api/v1/docs"
              target="_blank"
              rel="noreferrer"
              style={styles.secondaryCta}
            >
              Interactive Swagger API ↗
            </a>
          </div>

          {/* Architectural Metrics Strip */}
          <div style={styles.metricsStrip}>
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>100%</span>
              <span style={styles.metricLabel}>Atomic Slot Safety</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>0</span>
              <span style={styles.metricLabel}>Race Oversubscription</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>RFC 7807</span>
              <span style={styles.metricLabel}>Problem Details Protocol</span>
            </div>
            <div style={styles.metricDivider} />
            <div style={styles.metricItem}>
              <span style={styles.metricVal}>Node 22</span>
              <span style={styles.metricLabel}>Alpine Multi-Stage Container</span>
            </div>
          </div>
        </section>

        {/* HIGH-VALUE CONCURRENCY CALLOUT BANNER */}
        <section style={styles.differentiatorBanner} className="nexus-glass-card">
          <div style={styles.bannerContent}>
            <div style={styles.bannerTag}>ENGINEERING DIFFERENTIATOR</div>
            <h3 style={styles.bannerTitle}>Guaranteed Zero-Oversubscription Concurrency</h3>
            <p style={styles.bannerText}>
              When high-demand positions have limited vacancies, concurrent applicant traffic is safely serialized
              directly inside MongoDB via atomic condition-based execution (<code>findOneAndUpdate</code> with <code>$inc</code> and <code>remainingSlots &gt; 0</code>).
              Verified through automated 25-thread stress tests with 100% test pass rate.
            </p>
          </div>
          <div style={styles.bannerStats}>
            <div style={styles.miniStatBox}>
              <span style={styles.miniStatNumber}>25</span>
              <span style={styles.miniStatText}>Parallel Test Requests</span>
            </div>
            <div style={styles.miniStatBox}>
              <span style={styles.miniStatNumber}>5</span>
              <span style={styles.miniStatText}>Allocated Slots</span>
            </div>
            <div style={styles.miniStatBox}>
              <span style={styles.miniStatNumber}>0</span>
              <span style={styles.miniStatText}>Leaked Openings</span>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTER BAR */}
        <section id="jobs-section" style={styles.filterSection}>
          <form onSubmit={handleSearch} style={styles.searchBar}>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔍</span>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Search by title, role, or tech stack..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📍</span>
              <input
                style={styles.searchInput}
                type="text"
                placeholder="Location (e.g. Remote, Berlin)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <select
              style={styles.selectInput}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Employment Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
            </select>

            <button type="submit" style={styles.searchBtn}>
              Filter
            </button>
          </form>

          {/* Category Chips */}
          <div style={styles.categoryPills}>
            {categories.map((cat) => {
              const active = (category === cat) || (!category && cat === 'All');
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat === 'All' ? '' : cat);
                    setPage(1);
                  }}
                  style={active ? styles.categoryPillActive : styles.categoryPill}
                >
                  {cat}
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
                <h2 style={styles.sectionHeading}>⚡ AI-Matched Opportunities</h2>
                <p style={styles.sectionSub}>Ranked via cosine similarity of your bio skills against job requirements</p>
              </div>
              <Link to="/profile" style={styles.syncSkillsBtn}>
                Update Bio Skills →
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
                  Extract Skills from Bio
                </Link>
              </div>
            ) : (
              <div style={styles.grid}>
                {recommended.slice(0, 3).map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ALL POSITIONS SECTION */}
        <section style={styles.sectionBlock}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionHeading}>Verified Open Positions</h2>
              <p style={styles.sectionSub}>
                {loadingJobs ? 'Loading positions...' : `${total} active ${total === 1 ? 'opening' : 'openings'} available`}
              </p>
            </div>
          </div>

          {loadingJobs ? (
            <div style={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div style={styles.emptyCard} className="nexus-glass-card">
              <p style={styles.emptyTitle}>No positions match your criteria</p>
              <p style={styles.emptySub}>Try broadening your search keywords or resetting filters.</p>
              <button
                onClick={() => {
                  setKeyword('');
                  setLocation('');
                  setType('');
                  setCategory('');
                  setPage(1);
                }}
                style={styles.primaryCtaSmall}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > 9 && (
            <div style={styles.paginationRow}>
              <button
                style={page === 1 ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span style={styles.pageInfo}>
                Page {page} of {Math.ceil(total / 9)}
              </span>
              <button
                style={page >= Math.ceil(total / 9) ? styles.pageBtnDisabled : styles.pageBtn}
                disabled={page >= Math.ceil(total / 9)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
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
    width: '900px',
    height: '600px',
    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.05), transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: '0',
    right: '-150px',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%)',
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
    padding: '4.5rem 1rem 3rem',
    maxWidth: '900px',
    margin: '0 auto'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.85rem',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.25)',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    color: '#a5b4fc',
    fontWeight: '500',
    marginBottom: '1.5rem'
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#818cf8',
    boxShadow: '0 0 8px #818cf8'
  },
  heroTitle: {
    fontSize: '3.25rem',
    fontWeight: '800',
    lineHeight: '1.15',
    letterSpacing: '-0.03em',
    marginBottom: '1.25rem'
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #a5b4fc 0%, #38bdf8 50%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    maxWidth: '680px',
    margin: '0 auto 2.25rem'
  },
  heroActions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '3.5rem'
  },
  primaryCta: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#ffffff',
    padding: '0.8rem 1.6rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.925rem',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
    transition: 'transform 0.15s ease'
  },
  secondaryCta: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#f8fafc',
    padding: '0.8rem 1.6rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.925rem',
    textDecoration: 'none',
    transition: 'all 0.15s ease'
  },
  metricsStrip: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.65)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.25rem 2rem',
    backdropFilter: 'blur(16px)',
    flexWrap: 'wrap',
    gap: '1.5rem'
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem'
  },
  metricVal: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#f8fafc'
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500'
  },
  metricDivider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  differentiatorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem 2.5rem',
    marginBottom: '3rem',
    gap: '2.5rem',
    flexWrap: 'wrap'
  },
  bannerContent: {
    maxWidth: '650px'
  },
  bannerTag: {
    fontSize: '0.725rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: '#34d399',
    marginBottom: '0.5rem'
  },
  bannerTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '0.5rem',
    letterSpacing: '-0.01em'
  },
  bannerText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: '1.6'
  },
  bannerStats: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap'
  },
  miniStatBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    minWidth: '95px'
  },
  miniStatNumber: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#60a5fa'
  },
  miniStatText: {
    fontSize: '0.7rem',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '0.2rem'
  },
  filterSection: {
    marginBottom: '2.5rem'
  },
  searchBar: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1rem'
  },
  inputWrapper: {
    flex: '1 1 240px',
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
    padding: '0.85rem 1rem 0.85rem 2.6rem',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  selectInput: {
    flex: '0 1 200px',
    padding: '0.85rem 1rem',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  },
  searchBtn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.85rem 1.75rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  categoryPills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  categoryPill: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    color: '#94a3b8',
    padding: '0.4rem 0.9rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  categoryPillActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    color: '#e0e7ff',
    padding: '0.4rem 0.9rem',
    borderRadius: '9999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  sectionBlock: {
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
  sectionHeading: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.01em'
  },
  sectionSub: {
    color: '#64748b',
    fontSize: '0.85rem',
    marginTop: '0.2rem'
  },
  syncSkillsBtn: {
    color: '#818cf8',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.25rem'
  },
  skeletonCard: {
    padding: '1.5rem',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
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
    fontSize: '1.1rem',
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
    background: '#6366f1',
    color: '#fff',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer'
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
  }
};
