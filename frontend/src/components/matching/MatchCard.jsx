import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import MatchScore from './MatchScore';
import MatchExplanation from './MatchExplanation';
import InviteModal from './InviteModal';

/**
 * Single researcher match card component
 * Displays researcher info, match score, and action buttons
 */
const MatchCard = ({
  match,
  onDismiss,
  showActions = true,
  userRole,
  selectable = false,
  selected = false,
  onToggleSelect,
  onInvite
}) => {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { researcher, matchScore, scoreBreakdown, strengths, concerns, hasApplied } = match;

  const handleViewProfile = () => {
    navigate(`/researcher/${researcher.user_id}`);
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(researcher.user_id);
    }
  };

  const handleInvite = () => {
    if (onInvite) {
      onInvite(researcher.user_id);
      return;
    }
    setShowInviteModal(true);
  };

  const hasCapacity = researcher.max_concurrent_projects
    ? (researcher.current_projects_count || 0) < researcher.max_concurrent_projects
    : true;
  const complianceCertifications = Array.isArray(researcher.compliance_certification_list)
    ? researcher.compliance_certification_list
    : typeof researcher.compliance_certifications === 'string'
      ? researcher.compliance_certifications
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
      : [];

  return (
    <div
      className="match-card"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        backgroundColor: '#ffffff',
        outline: selected ? '2px solid var(--primary-blue, #3b82f6)' : 'none',
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
          {selectable && (
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#6b7280' }}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect && onToggleSelect(researcher.user_id)}
                style={{ marginRight: '6px' }}
              />
              Compare
            </label>
          )}

          {/* Compliance certifications */}
          {complianceCertifications.length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {complianceCertifications.map((certification, index) => (
                <span
                  key={`${certification}-${index}`}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  {certification} ✓
                </span>
              ))}
            </div>
          )}
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

          {/* Additional info — rates, availability, capacity, start date */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280', marginBottom: '12px', flexWrap: 'wrap' }}>
            {researcher.projects_completed > 0 && (
              <span>&#10003; {researcher.projects_completed} projects completed</span>
            )}
            {(researcher.rate_min || researcher.rate_max) && (
              <span>
                &#128176; {researcher.rate_min && researcher.rate_max && researcher.rate_min !== researcher.rate_max
                  ? `$${researcher.rate_min}-$${researcher.rate_max}/hr`
                  : `$${researcher.rate_min || researcher.rate_max}/hr`}
              </span>
            )}
            {researcher.availability && (
              <span>&#128336; {researcher.availability}</span>
            )}
            {researcher.max_concurrent_projects != null && (
              <span style={{ color: hasCapacity ? '#059669' : '#f59e0b' }}>
                &#128203; {researcher.current_projects_count || 0}/{researcher.max_concurrent_projects} projects
              </span>
            )}
            {researcher.available_start_date && (
              <span>
                &#128197; Available {new Date(researcher.available_start_date).toLocaleDateString()}
              </span>
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
              &#10003; Already Applied
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

              {userRole === 'nonprofit' && (
                <button
                  onClick={handleInvite}
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
                  Invite to Project
                </button>
              )}

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

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          researcherName={researcher.name}
          researcherId={researcher.user_id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => setShowInviteModal(false)}
        />
      )}
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
      rate_min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      rate_max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      availability: PropTypes.string,
      available_start_date: PropTypes.string,
      current_projects_count: PropTypes.number,
      max_concurrent_projects: PropTypes.number,
      projects_completed: PropTypes.number,
      domains: PropTypes.arrayOf(PropTypes.string)
      ,
      compliance_certifications: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
      compliance_certification_list: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    matchScore: PropTypes.number.isRequired,
    scoreBreakdown: PropTypes.object.isRequired,
    strengths: PropTypes.arrayOf(PropTypes.string),
    concerns: PropTypes.arrayOf(PropTypes.string),
    hasApplied: PropTypes.bool
  }).isRequired,
  onDismiss: PropTypes.func,
  showActions: PropTypes.bool,
  userRole: PropTypes.string,
  selectable: PropTypes.bool,
  selected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
  onInvite: PropTypes.func
};

export default MatchCard;
