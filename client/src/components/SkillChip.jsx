import React, { useState } from 'react';

function SkillChip({ skill, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.chip,
        ...(hovered ? { borderColor: '#93c5fd', background: '#eff6ff', color: '#1d4ed8' } : {}),
        animation: 'scaleIn 0.2s ease both',
        animationDelay: `${Math.min(index * 0.03, 0.3)}s`
      }}
    >
      {skill}
    </span>
  );
}

const styles = {
  chip: {
    display: 'inline-block',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    color: '#334155',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 500,
    marginRight: 6,
    marginBottom: 6,
    transition: 'all 0.15s ease'
  }
};

export default SkillChip;
