import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';
import SaveJobButton from './SaveJobButton';

function JobCard({ job, index = 0 }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const remaining = job.remainingSlots !== undefined ? job.remainingSlots : job.totalSlots;
  const isFilled = remaining === 0 || job.status === 'closed';
  const delay = Math.min(index * 0.04, 0.3);

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        animation: 'slideUp 0.35s ease both',
        animationDelay: `${delay}s`,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered
          ? '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)'
          : '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        borderColor: hovered ? '#cbd5e1' : '#e2e8f0'
      }}
    >
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.companyGroup}>
          <div
            style={{
              ...styles.companyAvatar,
              transform: hovered ? 'scale(1.04)' : 'none'
            }}
          >
            {job.company?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <h3 style={styles.jobTitle}>{job.title}</h3>
            <p style={styles.companyName}>{job.company}</p>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} style={styles.actions}>
          <SaveJobButton jobId={job._id} initialSaved={job.isSaved} />
        </div>
      </div>

      {/* Badges Strip */}
      <div style={styles.badgeRow}>
        <CategoryBadge category={job.category} />

        <span style={styles.pillMeta}>
          📍 {job.location}
        </span>

        <span style={styles.pillMeta}>
          💼 {job.type}
        </span>

        {job.salary && (
          <span style={styles.salaryPill}>
            ${job.salary.toLocaleString()}/yr
          </span>
        )}

        <span style={isFilled ? styles.slotFilled : styles.slotOpen}>
          <span style={isFilled ? styles.slotDotFilled : styles.slotDotOpen}></span>
          {isFilled ? 'Positions Filled' : `${remaining} ${remaining === 1 ? 'Slot' : 'Slots'} Open`}
        </span>
      </div>

      {/* Tech tags */}
      {job.requirements && job.requirements.length > 0 && (
        <div style={styles.tagsContainer}>
          {job.requirements.slice(0, 4).map((req, i) => (
            <span key={i} style={styles.tag}>
              {req}
            </span>
          ))}
          {job.requirements.length > 4 && (
            <span style={styles.tagMore}>+{job.requirements.length - 4} more</span>
          )}
        </div>
      )}

      {/* AI Score (Semantic Vector Ranking) */}
      {job.score !== undefined && (
        <div style={styles.aiMatchBox}>
          <div style={styles.aiHeader}>
            <span style={styles.aiTitle}>AI Skill Match</span>
            <span style={styles.aiScore}>{Math.round(job.score * 100)}%</span>
          </div>
          <div style={styles.aiTrack}>
            <div
              style={{
                ...styles.aiBar,
                width: `${Math.min(100, Math.max(0, Math.round(job.score * 100)))}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.35rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
    position: 'relative',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem'
  },
  companyGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem'
  },
  companyAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    color: '#0f172a',
    flexShrink: 0,
    transition: 'transform 0.2s ease'
  },
  jobTitle: {
    color: '#0f172a',
    fontSize: '1.05rem',
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
    margin: 0
  },
  companyName: {
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: '500',
    marginTop: '0.2rem',
    margin: 0
  },
  actions: {
    display: 'flex',
    alignItems: 'center'
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.45rem'
  },
  pillMeta: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#475569',
    fontWeight: '500'
  },
  salaryPill: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#15803d',
    fontWeight: '600'
  },
  slotOpen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#065f46',
    fontWeight: '600'
  },
  slotDotOpen: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#059669'
  },
  slotFilled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#b91c1c',
    fontWeight: '500'
  },
  slotDotFilled: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#dc2626'
  },
  tagsContainer: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap'
  },
  tag: {
    fontSize: '0.725rem',
    padding: '0.2rem 0.5rem',
    background: '#f8fafc',
    borderRadius: '4px',
    color: '#475569',
    border: '1px solid #e2e8f0',
    fontWeight: '500'
  },
  tagMore: {
    fontSize: '0.725rem',
    padding: '0.2rem 0.4rem',
    color: '#64748b',
    fontWeight: '500'
  },
  aiMatchBox: {
    marginTop: '0.25rem',
    paddingTop: '0.65rem',
    borderTop: '1px solid #f1f5f9'
  },
  aiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.35rem'
  },
  aiTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#1e40af',
    letterSpacing: '0.01em'
  },
  aiScore: {
    color: '#0f172a',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  aiTrack: {
    height: '4px',
    background: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  aiBar: {
    height: '100%',
    background: '#1e40af',
    borderRadius: '9999px',
    transition: 'width 0.4s ease'
  }
};

export default JobCard;
