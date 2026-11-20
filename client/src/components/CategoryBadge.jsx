const categoryColors = {
  'Frontend':         { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
  'Backend':          { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  'AI/ML':            { bg: '#eef2ff', border: '#c7d2fe', color: '#4338ca' },
  'DevOps':           { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
  'Data Engineering': { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c' },
  'Other':            { bg: '#f1f5f9', border: '#e2e8f0', color: '#475569' },
};

function CategoryBadge({ category }) {
  const c = categoryColors[category] || categoryColors['Other'];
  return (
    <span
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        borderRadius: 6,
        padding: '3px 9px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      {category}
    </span>
  );
}

export default CategoryBadge;
