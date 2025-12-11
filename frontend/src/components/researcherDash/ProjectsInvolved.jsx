import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../config/api';
import { useAuth } from '../../auth/AuthContext';

export default function ProjectsInvolved() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('current');
    const [projects, setProjects] = useState({ current: [], completed: [], total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch(getApiUrl('/api/researchers/me/projects'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProjects(data.projects);
            } else {
                setError(data.error || 'Failed to fetch projects');
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const renderProjectCard = (project) => (
        <div key={project.id} className="card mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 className="card-title mb-2">
                            {project.type || 'Collaboration Agreement'}
                            <span className={`badge ms-2 ${project.status === 'completed' ? 'bg-success' : 'bg-primary'}`}>
                                {project.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                        </h5>
                        {project.organization && (
                            <div className="mb-2">
                                <strong>Organization:</strong> {project.organization.name}
                                {project.organization.mission && (
                                    <p className="text-muted small mb-1">{project.organization.mission}</p>
                                )}
                                {project.organization.focus_tags && (
                                    <div className="mb-2">
                                        {project.organization.focus_tags.split(',').map((tag, idx) => (
                                            <span key={idx} className="badge bg-secondary me-1">{tag.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {project.value && (
                            <p className="mb-1"><strong>Value:</strong> {project.value}</p>
                        )}
                        {project.budget_info && (
                            <p className="mb-1"><strong>Budget:</strong> {project.budget_info}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="tab-pane-content">
                <h3 className="mb-3">Projects Involved</h3>
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tab-pane-content">
            <h3 className="mb-3">Projects Involved</h3>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                        onClick={() => setActiveTab('current')}
                    >
                        Current Participation ({projects.current.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed ({projects.completed.length})
                    </button>
                </li>
            </ul>

            {activeTab === 'current' && (
                <div>
                    {projects.current.length === 0 ? (
                        <div className="alert alert-info">
                            No current projects. Start collaborating with nonprofits to see your projects here!
                        </div>
                    ) : (
                        projects.current.map(renderProjectCard)
                    )}
                </div>
            )}

            {activeTab === 'completed' && (
                <div>
                    {projects.completed.length === 0 ? (
                        <div className="alert alert-info">
                            No completed projects yet. Your finished collaborations will appear here.
                        </div>
                    ) : (
                        projects.completed.map(renderProjectCard)
                    )}
                </div>
            )}
        </div>
    );
}