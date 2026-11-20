import React, { useState } from 'react';

function SkillChip({ skill, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.chip,
        ...(hovered ? { borderColor: '#2563eb' } : {}),
        animation: 'scaleIn 0.2s ease both',
        animationDelay: `${Math.min(index * 0.04, 0.3)}s`
      }}
    >
      {skill}
    </span>
  );
}

const styles = {
  chip: {
    display: 'inline-block',
    background: '#0c1a2e',
    border: '0.5px solid #1e3a5f',
    color: '#93c5fd',
    borderRadius: 20,
    padding: '4px 12px',
    fontSize: 12,
    fontWeight: 500,
    marginRight: 8,
    marginBottom: 8,
    transition: 'border-color 0.2s ease'
  }
};

export default SkillChip;
