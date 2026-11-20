import React, { useState, useRef, useEffect } from 'react';

const OptionItem = ({ optLabel, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        ...styles.option,
        ...(isSelected ? styles.optionSelected : {}),
        ...(hovered && !isSelected ? { background: 'rgba(255, 255, 255, 0.05)', color: '#f8fafc' } : {})
      }}
      role="option"
      aria-selected={isSelected}
    >
      <span>{optLabel}</span>
      {isSelected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
};

export default function CustomDropdown({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  label = null,
  minWidth = 180,
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find currently selected option label
  const selectedOption = options.find((opt) =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder;

  return (
    <div style={{ ...styles.wrapper, minWidth, ...style }} ref={dropdownRef}>
      {label && <label style={styles.label}>{label}</label>}

      {/* Button Trigger */}
      <button
        type="button"
        style={isOpen ? { ...styles.trigger, ...styles.triggerActive } : styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span style={value ? styles.selectedText : styles.placeholderText}>
          {displayLabel}
        </span>
        <svg
          style={{
            ...styles.chevron,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={styles.menu} role="listbox">
          {options.map((opt, index) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const isSelected = optVal === value;

            return (
              <OptionItem
                key={index}
                optLabel={optLabel}
                isSelected={isSelected}
                onClick={() => {
                  onChange({ target: { value: optVal } });
                  setIsOpen(false);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    userSelect: 'none'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#cbd5e1'
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    background: 'rgba(18, 22, 34, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
  },
  triggerActive: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.2)'
  },
  selectedText: {
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  placeholderText: {
    color: '#64748b'
  },
  chevron: {
    color: '#94a3b8',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    flexShrink: 0
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 1000,
    background: '#121622',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '6px',
    boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    maxHeight: '260px',
    overflowY: 'auto',
    animation: 'slideDown 0.15s ease both'
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'background 0.1s ease, color 0.1s ease'
  },
  optionSelected: {
    background: 'rgba(37, 99, 235, 0.15)',
    color: '#ffffff',
    fontWeight: '600'
  }
};
