import React from 'react';
import PropTypes from 'prop-types';

/**
 * Filtering controls for match list
 * - Minimum score slider
 * - Sort options
 * - Method filters
 */
const MatchFilters = ({ filters, onFilterChange, availableMethods = [] }) => {
  const handleMinScoreChange = (e) => {
    onFilterChange({ ...filters, minScore: parseInt(e.target.value) });
  };

  const handleSortChange = (e) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };

  const handleMethodToggle = (method) => {
    const currentMethods = filters.methods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    onFilterChange({ ...filters, methods: newMethods });
  };

  const handleReset = () => {
    onFilterChange({
      minScore: 50,
      sortBy: 'score',
      methods: []
    });
  };

  return (
    <div
      className="match-filters"
      style={{
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          Filter Matches
        </h3>
        <button
          onClick={handleReset}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            color: 'var(--primary-blue, #3b82f6)',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Minimum Score Slider */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Minimum Match Score
          </label>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary-blue, #3b82f6)' }}>
            {filters.minScore}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minScore}
          onChange={handleMinScoreChange}
          style={{
            width: '100%',
            accentColor: 'var(--primary-blue, #3b82f6)'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Sort Options */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="score">Match Score (High to Low)</option>
          <option value="experience">Experience (Most to Least)</option>
          <option value="rate">Rate (Low to High)</option>
          <option value="availability">Availability (Soonest)</option>
        </select>
      </div>

      {/* Method Filters */}
      {availableMethods.length > 0 && (
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Research Methods
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {availableMethods.map((method) => {
              const isSelected = (filters.methods || []).includes(method);
              return (
                <button
                  key={method}
                  onClick={() => handleMethodToggle(method)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isSelected ? 'var(--primary-blue, #3b82f6)' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#374151',
                    border: `1px solid ${isSelected ? 'var(--primary-blue, #3b82f6)' : '#d1d5db'}`,
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {method}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

MatchFilters.propTypes = {
  filters: PropTypes.shape({
    minScore: PropTypes.number,
    sortBy: PropTypes.string,
    methods: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  availableMethods: PropTypes.arrayOf(PropTypes.string)
};

export default MatchFilters;
