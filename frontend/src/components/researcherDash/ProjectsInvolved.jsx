import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config/api';
import { useAuth } from '../../auth/AuthContext';
import AttachmentManager from '../projects/AttachmentManager';
import ReviewForm from '../reviews/ReviewForm';
import InvitationsTab from './InvitationsTab';
import ResearcherMatchesView from '../matching/ResearcherMatchesView';
import MilestoneTracker from '../milestones/MilestoneTracker';

const PROJECTS_INVOLVED_TABS = ['current', 'completed', 'applications', 'invitations', 'tentative'];

function isValidTab(tab) {
    return PROJECTS_INVOLVED_TABS.includes(tab);
}

export default function ProjectsInvolved({ initialTab = 'current' }) {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState(isValidTab(initialTab) ? initialTab : 'current');
    const [projects, setProjects] = useState({ current: [], completed: [], total: 0 });
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [error, setError] = useState('');
    const [applicationsError, setApplicationsError] = useState('');
    const [selectedProjectForAttachments, setSelectedProjectForAttachments] = useState(null);
    const [reviewProjectId, setReviewProjectId] = useState(null);
    const [selectedProjectForMilestones, setSelectedProjectForMilestones] = useState(null);

    useEffect(() => {
        setActiveTab(isValidTab(initialTab) ? initialTab : 'current');
    }, [initialTab]);

    useEffect(() => {
        if (!token) return;
        fetchProjects();
        fetchApplications();
    }, [token]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError('');
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

    const fetchApplications = async () => {
        try {
            setApplicationsLoading(true);
            setApplicationsError('');
            const res = await fetch(getApiUrl('/api/applications?type=project_application'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            const data = await res.json();
            if (res.ok) {
                setApplications(data.applications || []);
            } else {
                setApplicationsError(data.error || 'Failed to fetch applications');
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err);
            setApplicationsError('Failed to load applications');
        } finally {
            setApplicationsLoading(false);
        }
    };

    const pendingApplications = applications.filter((application) => application.status === 'pending');

    const renderProjectCard = (project) => (
        <div key={project.id} className="card mb-3">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 className="card-title mb-2">
                            {project.title || project.type || 'Collaboration Agreement'}
                            <span
                                className={`badge ms-2 ${project.status === 'completed' ? 'bg-success' : 'bg-primary'}`}
                                title={project.status === 'completed'
                                    ? 'This collaboration has been completed.'
                                    : 'This collaboration is active and in progress.'}
                            >
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
                                            <span
                                                key={idx}
                                                className="badge bg-secondary me-1"
                                                title={`Organization focus area: ${tag.trim()}`}
                                            >
                                                {tag.trim()}
                                            </span>
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

                        {(project.project_id || project.id) && (
                            <div className="d-flex gap-2 flex-wrap mt-2">
                                <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => setSelectedProjectForAttachments(project)}
                                >
                                    <i className="bi bi-paperclip me-1"></i>
                                    View Attachments
                                </button>
                                {project.status === 'completed' && project.project_id && (
                                    <button
                                        className={`btn btn-sm ${project.has_submitted_rating ? 'btn-success' : 'btn-outline-primary'}`}
                                        onClick={() => setReviewProjectId((prev) => prev === project.project_id ? null : project.project_id)}
                                        disabled={project.has_submitted_rating}
                                    >
                                        <i className={`bi ${project.has_submitted_rating ? 'bi-check-circle' : 'bi-star'} me-1`}></i>
                                        {project.has_submitted_rating
                                            ? 'Rated'
                                            : reviewProjectId === project.project_id
                                                ? 'Hide Rating Form'
                                                : 'Rate Collaboration'}
                                    </button>
                                )}
                                {project.project_id && (
                                    <button
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => setSelectedProjectForMilestones(project)}
                                        title="Review milestones and submit requests"
                                    >
                                        <i className="bi bi-kanban me-1"></i>
                                        Milestones
                                    </button>
                                )}
                                {project.project_id && (
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            const params = new URLSearchParams({
                                                projectId: String(project.project_id),
                                                applicationId: String(project.id),
                                            });
                                            navigate(`/agreements?${params.toString()}`);
                                        }}
                                        title="Open agreement workspace for this collaboration"
                                    >
                                        <i className="bi bi-file-earmark-text me-1"></i>
                                        Agreements
                                    </button>
                                )}
                            </div>
                        )}

                        {project.status === 'completed' && project.project_id && !project.has_submitted_rating && reviewProjectId === project.project_id && (
                            <div className="mt-3">
                                <ReviewForm
                                    projectId={project.project_id}
                                    token={token}
                                    onSubmitted={() => {
                                        setProjects((prev) => {
                                            const markRated = (items) => items.map((item) => (
                                                item.project_id === project.project_id
                                                    ? { ...item, has_submitted_rating: true }
                                                    : item
                                            ));

                                            return {
                                                ...prev,
                                                current: markRated(prev.current || []),
                                                completed: markRated(prev.completed || []),
                                            };
                                        });
                                        setReviewProjectId(null);
                                        fetchProjects();
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderApplicationCard = (application) => {
        const project = application.project || {};
        const metadata = application.metadata || {};
        const title = project.title || metadata.project_title || 'Applied Project';
        const budgetMin = Number(project.budget_min) || null;
        const budgetMax = Number(project.budget_max) || null;

        return (
            <div key={application.id} className="card mb-3">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <h5 className="card-title mb-1">{title}</h5>
                            <p className="mb-1 text-muted small">
                                Submitted {new Date(application.created_at).toLocaleDateString()}
                            </p>
                            {application.organization?.name && (
                                <p className="mb-2"><strong>Organization:</strong> {application.organization.name}</p>
                            )}
                            {(budgetMin || budgetMax) && (
                                <p className="mb-2">
                                    <strong>Budget:</strong>{' '}
                                    {budgetMin ? `$${budgetMin.toLocaleString()}` : '$0'}
                                    {budgetMax ? ` - $${budgetMax.toLocaleString()}` : ''}
                                </p>
                            )}
                            {application.value && (
                                <div className="p-2 rounded border bg-light mt-2">
                                    <strong className="small text-uppercase text-muted">Application Message</strong>
                                    <p className="mb-0 mt-1">{application.value}</p>
                                </div>
                            )}
                        </div>
                        <span
                            className="badge bg-warning text-dark"
                            title="Pending review by the project owner"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            Pending Owner Response
                        </span>
                    </div>
                </div>
            </div>
        );
    };

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

            <ul className="nav nav-tabs mb-3" role="tablist" aria-label="Projects involved tabs">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'current' ? 'active' : ''}`}
                        onClick={() => setActiveTab('current')}
                        type="button"
                    >
                        Current Participation ({projects.current.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                        type="button"
                    >
                        Completed ({projects.completed.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('applications')}
                        type="button"
                    >
                        Applied Projects ({pendingApplications.length})
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'invitations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invitations')}
                        type="button"
                    >
                        Invitations
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'tentative' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tentative')}
                        type="button"
                    >
                        Tentative Projects
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

            {activeTab === 'applications' && (
                <div>
                    {applicationsLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : applicationsError ? (
                        <div className="alert alert-danger" role="alert">
                            {applicationsError}
                        </div>
                    ) : pendingApplications.length === 0 ? (
                        <div className="alert alert-info">
                            You do not have pending applications. When you apply to projects, they remain here until owners accept or reject them.
                        </div>
                    ) : (
                        pendingApplications.map(renderApplicationCard)
                    )}
                </div>
            )}

            {activeTab === 'invitations' && <InvitationsTab embedded />}

            {activeTab === 'tentative' && <ResearcherMatchesView userId={user?.id} />}

            {selectedProjectForAttachments && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Attachments - {selectedProjectForAttachments.title || selectedProjectForAttachments.type || 'Project'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedProjectForAttachments(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <AttachmentManager
                                    projectId={selectedProjectForAttachments.project_id || selectedProjectForAttachments.id}
                                    canUpload={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedProjectForMilestones && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Milestones - {selectedProjectForMilestones.title || selectedProjectForMilestones.type || 'Project'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedProjectForMilestones(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <MilestoneTracker
                                    projectId={selectedProjectForMilestones.project_id || selectedProjectForMilestones.id}
                                    mode="researcher"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}