import React, { useState, useEffect } from "react";
import MilestoneTracker from "../milestones/MilestoneTracker";

export default function ProjectList({ onEdit, onRefresh }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(""); // Status filter
  const [deletingId, setDeletingId] = useState(null);
  const [viewingMilestones, setViewingMilestones] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  useEffect(() => {
    if (onRefresh) {
      fetchProjects();
    }
  }, [onRefresh]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("trident_token");
      const url = filter ? `/api/projects?status=${filter}` : "/api/projects";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch projects");
      }

      setProjects(data.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    setDeletingId(projectId);
    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      // Remove from list
      setProjects((prev) => prev.filter((p) => p.project_id !== projectId));
    } catch (err) {
      alert(`Error deleting project: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitForReview = async (projectId) => {
    if (!confirm("Submit this project for admin review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(`/api/projects/${projectId}/submit-for-review`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit for review");
      }

      alert(data.message);
      fetchProjects(); // Refresh list
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: "secondary",
      pending_review: "warning",
      approved: "success",
      needs_revision: "danger",
      rejected: "dark",
      open: "success",
      in_progress: "primary",
      completed: "info",
      cancelled: "danger",
    };
    return badges[status] || "secondary";
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    return `$${parseFloat(budget).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
        <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchProjects}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2 align-items-center">
          <label htmlFor="statusFilter" className="form-label mb-0">
            Filter:
          </label>
          <select
            id="statusFilter"
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Projects</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="rejected">Rejected</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button className="btn btn-sm btn-outline-primary" onClick={fetchProjects}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {/* Project Count */}
      <p className="text-muted mb-3">
        {projects.length} {projects.length === 1 ? "project" : "projects"} found
      </p>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No projects found. Create your first project to get started!
        </div>
      ) : (
        <div className="row">
          {projects.map((project) => (
            <div key={project.project_id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{project.title}</h5>
                    <span className={`badge bg-${getStatusBadge(project.status)}`}>
                      {project.status.replace("_", " ")}
                    </span>
                  </div>

                  {project.problem && (
                    <p className="card-text text-muted small mb-2">
                      <strong>Problem:</strong> {project.problem.substring(0, 100)}
                      {project.problem.length > 100 && "..."}
                    </p>
                  )}

                  {project.methods_required && (
                    <p className="card-text small mb-1">
                      <strong>Methods:</strong> {project.methods_required.substring(0, 80)}
                      {project.methods_required.length > 80 && "..."}
                    </p>
                  )}

                  <div className="row small text-muted mt-2">
                    {project.timeline && (
                      <div className="col-6 mb-1">
                        <i className="bi bi-clock me-1"></i>
                        {project.timeline}
                      </div>
                    )}
                    {project.budget_min && (
                      <div className="col-6 mb-1">
                        <i className="bi bi-currency-dollar me-1"></i>
                        {formatBudget(project.budget_min)}
                      </div>
                    )}
                    {project.data_sensitivity && (
                      <div className="col-12 mb-1">
                        <i className="bi bi-shield-check me-1"></i>
                        {project.data_sensitivity} sensitivity
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer bg-transparent">
                  {(project.status === 'draft' || project.status === 'needs_revision') && (
                    <button
                      className="btn btn-sm btn-success w-100 mb-2"
                      onClick={() => handleSubmitForReview(project.project_id)}
                    >
                      <i className="bi bi-send me-1"></i>
                      Submit for Review
                    </button>
                  )}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary flex-grow-1"
                      onClick={() => setViewingMilestones(project)}
                    >
                      <i className="bi bi-list-check me-1"></i>
                      Milestones
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEdit && onEdit(project.project_id)}
                      disabled={project.status === 'pending_review'}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(project.project_id)}
                      disabled={deletingId === project.project_id || project.status === 'pending_review'}
                    >
                      {deletingId === project.project_id ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestone Modal */}
      {viewingMilestones && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Milestones - {viewingMilestones.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setViewingMilestones(null)}
                ></button>
              </div>
              <div className="modal-body">
                <MilestoneTracker projectId={viewingMilestones.project_id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
