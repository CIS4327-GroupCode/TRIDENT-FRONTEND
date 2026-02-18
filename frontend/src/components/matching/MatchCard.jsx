import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MatchScore from './MatchScore';
import MatchExplanation from './MatchExplanation';

/**
 * Single researcher match card component
 * Displays researcher info, match score, and action buttons
 */
const MatchCard = ({ match, onDismiss, showActions = true }) => {
  const navigate = useNavigate();
  const { researcher, matchScore, scoreBreakdown, strengths, concerns, hasApplied } = match;

  const handleViewProfile = () => {
    navigate(`/researcher/${researcher.user_id}`);
  };

  const handleContact = () => {
    // TODO: Implement contact/message functionality
    console.log('Contact researcher:', researcher.user_id);
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(researcher.user_id);
    }
  };

  return (
    <div
      className="match-card"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Match score */}
        <div style={{ flexShrink: 0 }}>
          <MatchScore score={matchScore} size="medium" showLabel={false} />
        </div>

        {/* Researcher info */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
              {researcher.name}
            </h3>
            {researcher.title && (
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#6b7280' }}>
                {researcher.title}
              </p>
            )}
            {researcher.institution && (
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {researcher.institution}
              </p>
            )}
          </div>

          {/* Expertise tags */}
          {researcher.expertise && researcher.expertise.length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {researcher.expertise.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#eff6ff',
                    color: '#3b82f6',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  {skill}
                </span>
              ))}
              {researcher.expertise.length > 5 && (
                <span style={{ fontSize: '12px', color: '#6b7280', alignSelf: 'center' }}>
                  +{researcher.expertise.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Additional info */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
            {researcher.projects_completed > 0 && (
              <span>✓ {researcher.projects_completed} projects completed</span>
            )}
            {researcher.rate_min && researcher.rate_max && (
              <span>💰 ${researcher.rate_min}-${researcher.rate_max}/hr</span>
            )}
          </div>

          {/* Applied badge */}
          {hasApplied && (
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '12px'
              }}
            >
              ✓ Already Applied
            </div>
          )}

          {/* Score explanation */}
          <MatchExplanation
            scoreBreakdown={scoreBreakdown}
            strengths={strengths}
            concerns={concerns}
          />

          {/* Action buttons */}
          {showActions && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={handleViewProfile}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary-blue, #3b82f6)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-blue, #3b82f6)';
                }}
              >
                View Profile
              </button>

              <button
                onClick={handleContact}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffffff',
                  color: 'var(--primary-blue, #3b82f6)',
                  border: '1px solid var(--primary-blue, #3b82f6)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Contact
              </button>

              {!hasApplied && onDismiss && (
                <button
                  onClick={handleDismiss}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MatchCard.propTypes = {
  match: PropTypes.shape({
    researcher: PropTypes.shape({
      user_id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      title: PropTypes.string,
      institution: PropTypes.string,
      expertise: PropTypes.arrayOf(PropTypes.string),
      methods: PropTypes.arrayOf(PropTypes.string),
      rate_min: PropTypes.number,
      rate_max: PropTypes.number,
      projects_completed: PropTypes.number,
      domains: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    matchScore: PropTypes.number.isRequired,
    scoreBreakdown: PropTypes.object.isRequired,
    strengths: PropTypes.arrayOf(PropTypes.string),
    concerns: PropTypes.arrayOf(PropTypes.string),
    hasApplied: PropTypes.bool
  }).isRequired,
  onDismiss: PropTypes.func,
  showActions: PropTypes.bool
};

export default MatchCard;
