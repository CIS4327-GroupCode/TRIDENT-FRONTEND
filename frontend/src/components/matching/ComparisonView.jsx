import React from 'react';
import PropTypes from 'prop-types';
import MatchScore from './MatchScore';

const cellStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: '14px',
  color: '#374151'
};

const renderRange = (min, max, unit = '') => {
  if (min && max && Number(min) !== Number(max)) return `${min}-${max}${unit}`;
  return `${min || max || 'N/A'}${unit}`;
};

const ComparisonView = ({ selectedMatches, onInvite, onClear }) => {
  if (!selectedMatches || selectedMatches.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        marginBottom: '20px',
        overflowX: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Compare Researchers</h3>
        <button
          onClick={onClear}
          style={{
            border: '1px solid #d1d5db',
            backgroundColor: '#fff',
            borderRadius: '6px',
            padding: '8px 10px',
            cursor: 'pointer'
          }}
        >
          Clear Selection
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign: 'left', width: '220px' }}>Field</th>
            {selectedMatches.map((match) => (
              <th key={match.researcher.user_id} style={{ ...cellStyle, textAlign: 'left', minWidth: '260px' }}>
                {match.researcher.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>Match Score</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>
                <MatchScore score={match.matchScore} size="small" showLabel={false} />
              </td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Title</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>{match.researcher.title || 'N/A'}</td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Institution</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>{match.researcher.institution || 'N/A'}</td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Rate</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>${renderRange(match.researcher.rate_min, match.researcher.rate_max, '/hr')}</td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Projects Completed</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>{match.researcher.projects_completed || 0}</td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Availability</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>{match.researcher.availability || 'N/A'}</td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Strengths</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>
                {(match.strengths || []).slice(0, 3).join(', ') || 'N/A'}
              </td>
            ))}
          </tr>
          <tr>
            <td style={cellStyle}>Actions</td>
            {selectedMatches.map((match) => (
              <td key={match.researcher.user_id} style={cellStyle}>
                <button
                  onClick={() => onInvite(match.researcher.user_id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--primary-blue, #3b82f6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Invite
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

ComparisonView.propTypes = {
  selectedMatches: PropTypes.arrayOf(PropTypes.object).isRequired,
  onInvite: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};

export default ComparisonView;
