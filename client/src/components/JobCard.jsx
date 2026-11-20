import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';
import SaveJobButton from './SaveJobButton';

function JobCard({ job, index = 0 }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const remaining = job.remainingSlots !== undefined ? job.remainingSlots : job.totalSlots;
  const isFilled = remaining === 0 || job.status === 'closed';
  const delay = Math.min(index * 0.05, 0.4);

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        animation: 'slideUp 0.4s ease both',
        animationDelay: `${delay}s`,
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        borderColor: hovered ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255, 255, 255, 0.08)'
      }}
      className="nexus-glass-card"
    >
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.companyGroup}>
          <div
            style={{
              ...styles.companyAvatar,
              transform: hovered ? 'scale(1.05)' : 'none'
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
            <span style={styles.tagMore}>+{job.requirements.length - 4}</span>
          )}
        </div>
      )}

      {/* AI Score (Semantic Vector Ranking) */}
      {job.score !== undefined && (
        <div style={styles.aiMatchBox}>
          <div style={styles.aiHeader}>
            <span style={styles.aiTitle}>⚡ Semantic AI Alignment</span>
            <span style={styles.aiScore}>{Math.round(job.score * 100)}%</span>
          </div>
          <div style={styles.aiTrack}>
            <div
              style={{
                ...styles.aiBar,
                width: `${Math.min(100, Math.max(0, Math.round(job.score * 100)))}%`,
                animation: 'progressFill 0.8s ease both',
                animationDelay: `${delay}s`
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
    background: 'rgba(15, 19, 28, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem'
  },
  companyGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem'
  },
  companyAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '1.15rem',
    transition: 'transform 0.2s ease'
  },
  jobTitle: {
    color: '#f8fafc',
    fontSize: '1.05rem',
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '-0.01em'
  },
  companyName: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginTop: '0.15rem'
  },
  actions: {
    display: 'flex',
    alignItems: 'center'
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem'
  },
  pillMeta: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#cbd5e1',
    fontWeight: '500'
  },
  salaryPill: {
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#38bdf8',
    fontWeight: '600'
  },
  slotOpen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#34d399',
    fontWeight: '600'
  },
  slotDotOpen: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#10b981'
  },
  slotFilled: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    padding: '0.25rem 0.55rem',
    fontSize: '0.75rem',
    color: '#f87171',
    fontWeight: '500'
  },
  slotDotFilled: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#ef4444'
  },
  tagsContainer: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem'
  },
  tag: {
    fontSize: '0.725rem',
    padding: '0.15rem 0.45rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '4px',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tagMore: {
    fontSize: '0.7rem',
    padding: '0.15rem 0.35rem',
    color: '#64748b'
  },
  aiMatchBox: {
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
  },
  aiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem'
  },
  aiTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#60a5fa',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  aiScore: {
    color: '#f8fafc',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  aiTrack: {
    height: '5px',
    background: 'rgba(255, 255, 255, 0.07)',
    borderRadius: '9999px',
    overflow: 'hidden'
  },
  aiBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #10b981)',
    borderRadius: '9999px',
    transition: 'width 0.4s ease'
  }
};

export default JobCard;
