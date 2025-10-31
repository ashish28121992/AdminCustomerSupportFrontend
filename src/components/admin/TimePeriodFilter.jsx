import React, { useState, useRef, useEffect } from 'react';
import './TimePeriodFilter.css';

function TimePeriodFilter({ selectedPeriod, onPeriodChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const periods = [
    { 
      id: '1day', 
      label: '1 Day', 
      description: 'Last 24 hours',
      icon: '📅', 
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    { 
      id: '7days', 
      label: '7 Days', 
      description: 'Last week',
      icon: '📆', 
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    { 
      id: '30days', 
      label: '30 Days', 
      description: 'Last month',
      icon: '🗓️', 
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    },
    { 
      id: 'realtime', 
      label: 'Real Time', 
      description: 'Live updates',
      icon: '⚡', 
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  ];

  const selectedPeriodData = periods.find(p => p.id === selectedPeriod) || periods[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      // Don't close if clicking inside dropdown or button
      if (dropdownRef.current?.contains(event.target) || 
          buttonRef.current?.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    }

    // Add event listener with a small delay to avoid immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="time-period-filter">
      <button
        ref={buttonRef}
        className={`filter-toggle ${isOpen ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        type="button"
      >
        <span className="filter-icon" style={{ background: selectedPeriodData.gradient }}>
          {selectedPeriodData.icon}
        </span>
        <div className="filter-text">
          <span className="filter-label">{selectedPeriodData.label}</span>
          <span className="filter-description">{selectedPeriodData.description}</span>
        </div>
        <span className={`filter-arrow ${isOpen ? 'rotated' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <div 
            className="filter-backdrop"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            ref={dropdownRef}
            className="filter-dropdown"
          >
          {/* Period Options */}
          <div className="dropdown-periods">
            {periods.map((period, index) => (
              <button
                key={period.id}
                className={`filter-option ${selectedPeriod === period.id ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPeriodChange(period.id);
                  setIsOpen(false); // Close dropdown after selection
                }}
                style={{ animationDelay: `${index * 50}ms` }}
                type="button"
              >
                <span className="option-icon" style={{ background: period.gradient }}>
                  {period.icon}
                </span>
                <div className="option-text">
                  <span className="option-label">{period.label}</span>
                  <span className="option-desc">{period.description}</span>
                </div>
                {selectedPeriod === period.id && (
                  <span className="option-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default TimePeriodFilter;

