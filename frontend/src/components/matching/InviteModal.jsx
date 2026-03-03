import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../auth/AuthContext';
import { fetchApiWithAuth } from '../../config/api';

/**
 * Modal for nonprofits to invite a researcher to one of their open projects
 */
const InviteModal = ({ researcherName, researcherId, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchApiWithAuth('/projects', { method: 'GET' }, token);
        const openProjects = (data.projects || []).filter(p => p.status === 'open');
        setProjects(openProjects);
        if (openProjects.length > 0) {
          setSelectedProjectId(String(openProjects[0].project_id));
        }
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await fetchApiWithAuth('/applications/invite', {
        method: 'POST',
        body: JSON.stringify({
          researcherId,
          projectId: parseInt(selectedProjectId),
          message: message.trim() || null
        })
      }, token);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1050
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
        width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Invite to Project</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#6b7280', lineHeight: 1
          }}>&times;</button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
          Send an invitation to <strong>{researcherName}</strong> to collaborate on one of your projects.
        </p>

        {success ? (
          <div style={{
            padding: '16px', backgroundColor: '#dcfce7', border: '1px solid #86efac',
            borderRadius: '8px', color: '#166534', textAlign: 'center'
          }}>
            Invitation sent successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', color: '#991b1b', marginBottom: '16px', fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Project
              </label>
              {loading ? (
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading projects...</p>
              ) : projects.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#f59e0b' }}>
                  No open projects available. Create a project first.
                </p>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
                    borderRadius: '6px', fontSize: '14px', backgroundColor: '#ffffff'
                  }}
                >
                  {projects.map(p => (
                    <option key={p.project_id} value={String(p.project_id)}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the researcher why you think they'd be a great fit..."
                rows={4}
                maxLength={1000}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #d1d5db',
                  borderRadius: '6px', fontSize: '14px', resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 20px', backgroundColor: '#ffffff', color: '#374151',
                  border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loading || projects.length === 0}
                style={{
                  padding: '10px 20px',
                  backgroundColor: submitting ? '#93c5fd' : 'var(--primary-blue, #3b82f6)',
                  color: '#ffffff', border: 'none', borderRadius: '6px',
                  fontSize: '14px', fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

InviteModal.propTypes = {
  researcherName: PropTypes.string.isRequired,
  researcherId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default InviteModal;
