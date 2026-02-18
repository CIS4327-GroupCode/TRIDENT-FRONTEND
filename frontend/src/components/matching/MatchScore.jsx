import React from 'react';
import PropTypes from 'prop-types';

/**
 * Visual match score indicator with color coding
 * - Green (>80): Excellent match
 * - Yellow (60-79): Good match
 * - Red (<60): Weak match
 */
const MatchScore = ({ score, size = 'medium', showLabel = true }) => {
  // Determine color based on score thresholds
  const getScoreColor = () => {
    if (score >= 80) return 'var(--success-green, #22c55e)';
    if (score >= 60) return 'var(--warning-yellow, #f59e0b)';
    return 'var(--error-red, #ef4444)';
  };

  // Determine text label
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Weak Match';
  };

  // Size variants
  const sizeStyles = {
    small: {
      container: { width: '60px', height: '60px' },
      fontSize: '16px',
      labelFontSize: '12px'
    },
    medium: {
      container: { width: '80px', height: '80px' },
      fontSize: '20px',
      labelFontSize: '14px'
    },
    large: {
      container: { width: '100px', height: '100px' },
      fontSize: '24px',
      labelFontSize: '16px'
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;
  const color = getScoreColor();

  return (
    <div className="match-score-container" style={{ textAlign: 'center' }}>
      {/* Circular score indicator */}
      <div
        className="match-score-circle"
        style={{
          ...currentSize.container,
          borderRadius: '50%',
          border: `4px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          backgroundColor: `${color}10`, // 10% opacity
          transition: 'all 0.3s ease'
        }}
      >
        <span
          className="match-score-value"
          style={{
            fontSize: currentSize.fontSize,
            fontWeight: 'bold',
            color: color
          }}
        >
          {Math.round(score)}
        </span>
      </div>

      {/* Optional label */}
      {showLabel && (
        <div
          className="match-score-label"
          style={{
            marginTop: '8px',
            fontSize: currentSize.labelFontSize,
            color: color,
            fontWeight: '600'
          }}
        >
          {getScoreLabel()}
        </div>
      )}
    </div>
  );
};

MatchScore.propTypes = {
  score: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool
};

export default MatchScore;
