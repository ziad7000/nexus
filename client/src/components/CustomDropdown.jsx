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
        ...(hovered && !isSelected ? styles.optionHovered : {})
      }}
      role="option"
      aria-selected={isSelected}
    >
      <span>{optLabel}</span>
      {isSelected && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  style = {},
  variant = 'default',
  triggerStyle = {}
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

  const selectedOption = options.find((opt) =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const displayLabel = selectedOption
    ? typeof selectedOption === 'object'
      ? selectedOption.label
      : selectedOption
    : placeholder;

  const isSearchVariant = variant === 'search';

  const baseTriggerStyle = isSearchVariant ? styles.triggerSearch : styles.trigger;
  const activeTriggerStyle = isSearchVariant ? styles.triggerSearchActive : styles.triggerActive;

  return (
    <div style={{ ...styles.wrapper, minWidth, ...style }} ref={dropdownRef}>
      {label && <label style={styles.label}>{label}</label>}

      {/* Button Trigger */}
      <button
        type="button"
        style={{
          ...baseTriggerStyle,
          ...(isOpen ? activeTriggerStyle : {}),
          ...triggerStyle
        }}
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
          strokeWidth="2"
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
    gap: '4px',
    userSelect: 'none',
    width: '100%'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569'
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#0f172a',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
  },
  triggerActive: {
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)'
  },
  triggerSearch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    padding: '4px 0',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'color 0.15s ease'
  },
  triggerSearchActive: {
    color: '#1d4ed8'
  },
  selectedText: {
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  placeholderText: {
    color: '#94a3b8'
  },
  chevron: {
    color: '#64748b',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    flexShrink: 0
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 1000,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '4px',
    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
    maxHeight: '260px',
    overflowY: 'auto',
    animation: 'slideDown 0.15s ease both'
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.55rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#334155',
    cursor: 'pointer',
    transition: 'background 0.1s ease, color 0.1s ease'
  },
  optionHovered: {
    background: '#f8fafc',
    color: '#0f172a'
  },
  optionSelected: {
    background: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: '600'
  }
};
