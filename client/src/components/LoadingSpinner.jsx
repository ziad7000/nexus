import React from 'react';

function LoadingSpinner() {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.spinner} />
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  spinner: {
    width: 26,
    height: 26,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #1e40af',
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
  },
};

export default LoadingSpinner;
