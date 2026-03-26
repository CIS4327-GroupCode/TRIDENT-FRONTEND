import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../../config/api';
import { useNavigate } from 'react-router-dom';

/**
 * Nonprofit view of incoming researcher applications
 * Shows applications grouped by project with accept/reject actions
 */
const ApplicationsTab = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch nonprofit's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('trident_token');
        const response = await fetch(`${getApiBaseUrl()}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        const openProjects = data.projects.filter(p => p.status === 'open');
        setProjects(openProjects);
        if (openProjects.length > 0) {
          setSelectedProjectId(openProjects[0].project_id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch applications for selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    const fetchApplications = async () => {
      try {
        setAppsLoading(true);
        const token = localStorage.getItem('trident_token');
        const response = await fetch(
          `${getApiBaseUrl()}/api/applications/projects/${selectedProjectId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setAppsLoading(false);
      }
    };
    fetchApplications();
  }, [selectedProjectId]);

  const handleAction = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('trident_token');
      const response = await fetch(
        `${getApiBaseUrl()}/api/applications/${applicationId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(action === 'reject' ? { reason: '' } : {})
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${action} application`);
      }
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: action === 'accept' ? 'accepted' : 'rejected' }
            : app
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          Something went wrong
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          No Open Projects
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Create a project to start receiving applications from researchers.
        </p>
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending');
  const reviewedApps = applications.filter(a => a.status !== 'pending');

  return (
    <div>
      {/* Project selector */}
      {projects.length > 1 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            Select Project
          </label>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            {projects.map(project => (
              <option key={project.project_id} value={project.project_id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '600', color: '#111827' }}>
        Applications for: {projects.find(p => p.project_id === selectedProjectId)?.title}
      </h2>
      <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>
        Review and respond to researcher applications
      </p>

      {appsLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
            No Applications Yet
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Researchers haven't applied to this project yet. Check back later.
          </p>
        </div>
      ) : (
        <>
          {/* Pending Applications */}
          {pendingApps.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                Pending ({pendingApps.length})
              </h3>
              {pendingApps.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onAccept={() => handleAction(app.id, 'accept')}
                  onReject={() => handleAction(app.id, 'reject')}
                  onViewProfile={() => navigate(`/researcher/${app.researcher_id}`)}
                />
              ))}
            </div>
          )}

          {/* Reviewed Applications */}
          {reviewedApps.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#6b7280' }}>
                Reviewed ({reviewedApps.length})
              </h3>
              {reviewedApps.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onViewProfile={() => navigate(`/researcher/${app.researcher_id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Single application card
 */
const ApplicationCard = ({ application, onAccept, onReject, onViewProfile }) => {
  const isPending = application.status === 'pending';
  const isAccepted = application.status === 'accepted';
  const isRejected = application.status === 'rejected';

  const researcherName = application.metadata?.researcher_name ||
    application.researcher?.user?.name || 'Researcher';
  const appliedAt = application.metadata?.applied_at || application.created_at;
  const message = application.value;

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              {researcherName}
            </h4>
            <span style={{
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: isPending ? '#fef3c7' : isAccepted ? '#dcfce7' : '#fef2f2',
              color: isPending ? '#92400e' : isAccepted ? '#166534' : '#991b1b'
            }}>
              {application.status}
            </span>
          </div>

          {application.researcher?.affiliation && (
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
              {application.researcher.affiliation}
            </p>
          )}

          {appliedAt && (
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af' }}>
              Applied {new Date(appliedAt).toLocaleDateString()}
            </p>
          )}

          {message && (
            <div style={{
              margin: '12px 0',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
              borderLeft: '3px solid #d1d5db',
              borderRadius: '0 6px 6px 0',
              fontSize: '14px',
              color: '#374151',
              fontStyle: 'italic'
            }}>
              "{message}"
            </div>
          )}

          {application.researcher?.domains && application.researcher.domains.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {application.researcher.domains.slice(0, 4).map((domain, i) => (
                <span key={i} style={{
                  padding: '2px 10px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {domain}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
          <button
            onClick={onViewProfile}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: 'var(--primary-blue, #3b82f6)',
              border: '1px solid var(--primary-blue, #3b82f6)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            View Profile
          </button>
          {isPending && onAccept && (
            <button
              onClick={onAccept}
              style={{
                padding: '8px 16px',
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Accept
            </button>
          )}
          {isPending && onReject && (
            <button
              onClick={onReject}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                border: '1px solid #dc2626',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTab;
