import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Expandable match score breakdown showing individual factor scores
 * Displays bars for each scoring factor with visual indicators
 */
const MatchExplanation = ({ scoreBreakdown, strengths, concerns }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Factor metadata with max points and descriptions
  const factorInfo = {
    expertise: { label: 'Expertise Match', max: 30, color: '#3b82f6' },
    methods: { label: 'Research Methods', max: 25, color: '#8b5cf6' },
    budget: { label: 'Budget Alignment', max: 15, color: '#10b981' },
    availability: { label: 'Availability', max: 10, color: '#f59e0b' },
    experience: { label: 'Experience Level', max: 10, color: '#ec4899' },
    domain: { label: 'Domain Match', max: 10, color: '#06b6d4' }
  };

  return (
    <div className="match-explanation" style={{ marginTop: '16px' }}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary-blue, #3b82f6)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          padding: '8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▶
        </span>
        {isExpanded ? 'Hide' : 'Show'} Score Breakdown
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="match-explanation-content" style={{ marginTop: '16px' }}>
          {/* Score factors */}
          <div className="score-factors" style={{ marginBottom: '24px' }}>
            {Object.entries(scoreBreakdown).map(([factor, score]) => {
              const info = factorInfo[factor];
              if (!info) return null;

              const percentage = (score / info.max) * 100;

              return (
                <div key={factor} style={{ marginBottom: '16px' }}>
                  {/* Factor label and score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>
                      {info.label}
                    </span>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>
                      {Math.round(score)}/{info.max}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: info.color,
                        transition: 'width 0.3s ease',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths */}
          {strengths && strengths.length > 0 && (
            <div className="match-strengths" style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>
                ✓ Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {strengths.map((strength, index) => (
                  <li key={index} style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {concerns && concerns.length > 0 && (
            <div className="match-concerns">
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#f59e0b' }}>
                ⚠ Considerations
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {concerns.map((concern, index) => (
                  <li key={index} style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MatchExplanation.propTypes = {
  scoreBreakdown: PropTypes.shape({
    expertise: PropTypes.number.isRequired,
    methods: PropTypes.number.isRequired,
    budget: PropTypes.number.isRequired,
    availability: PropTypes.number.isRequired,
    experience: PropTypes.number.isRequired,
    domain: PropTypes.number.isRequired
  }).isRequired,
  strengths: PropTypes.arrayOf(PropTypes.string),
  concerns: PropTypes.arrayOf(PropTypes.string)
};

export default MatchExplanation;
