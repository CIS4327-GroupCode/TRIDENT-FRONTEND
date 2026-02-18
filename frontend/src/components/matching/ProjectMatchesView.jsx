import React, { useState, useEffect } from 'react';
import MatchList from './MatchList';

/**
 * Wrapper component for nonprofits to view matches across all their projects
 * Shows a project selector if multiple projects exist
 */
const ProjectMatchesView = ({ apiBaseUrl }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch user's open projects
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('trident_token');
      
      const response = await fetch(`${apiBaseUrl}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      console.log(data)
      // Filter for open projects only
      const openProjects = data.projects.filter(p => p.status === 'open');
      
      setProjects(openProjects);
      
      // Auto-select first project if available
      if (openProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(openProjects[0].project_id);
      }
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading projects...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#991b1b'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
          Error Loading Projects
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
      </div>
    );
  }

  // No projects state
  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          No Open Projects
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Create a project to see matching researchers.
        </p>
      </div>
    );
  }

  return (
    <div className="project-matches-view">
      {/* Project selector (if multiple projects) */}
      {projects.length > 1 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
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

      {/* Current project title (if only one project or selection made) */}
      {selectedProjectId && (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '600', color: '#111827' }}>
              Matches for: {projects.find(p => p.project_id === selectedProjectId)?.title}
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Researchers whose skills and availability align with your project needs
            </p>
          </div>

          {/* Match list for selected project */}
          <MatchList projectId={selectedProjectId} apiBaseUrl={apiBaseUrl} />
        </>
      )}
    </div>
  );
};

export default ProjectMatchesView;
