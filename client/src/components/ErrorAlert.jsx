import React from 'react';

function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div style={styles.box} role="alert">
      <span style={styles.icon}>⚠️</span>
      <span>{message}</span>
    </div>
  );
}

const styles = {
  box: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#991b1b',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: '1rem',
  },
  icon: {
    fontSize: 14,
    flexShrink: 0
  }
};

export default ErrorAlert;
