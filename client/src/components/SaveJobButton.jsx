import { useState } from 'react';
import API from '../services/api';

function SaveJobButton({ jobId, initialSaved = false }) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();

    if (loading) return;

    setClicked(true);
    setTimeout(() => setClicked(false), 200);

    const previousState = isSaved;
    setIsSaved(!previousState);
    setLoading(true);

    try {
      const res = await API.post(`/jobs/${jobId}/save`);
      setIsSaved(res.data.saved);
    } catch (err) {
      setIsSaved(previousState);
      alert('Failed to save job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.btn,
        color: isSaved ? '#1d4ed8' : hovered ? '#0f172a' : '#94a3b8',
        background: isSaved ? '#eff6ff' : hovered ? '#f1f5f9' : 'transparent',
        borderColor: isSaved ? '#bfdbfe' : hovered ? '#cbd5e1' : 'transparent',
        transform: clicked ? 'scale(1.15)' : 'none'
      }}
      title={isSaved ? "Saved to your list (click to remove)" : "Save job"}
      aria-label={isSaved ? "Unsave Job" : "Save Job"}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
}

const styles = {
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
    padding: 0
  }
};

export default SaveJobButton;
