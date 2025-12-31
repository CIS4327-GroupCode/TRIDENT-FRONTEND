import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

export default function ProjectDetailModal({ projectId, onClose }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl(`/api/projects/browse/${projectId}`));
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch project details");
      }

      setProject(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    return `$${parseFloat(budget).toLocaleString()}`;
  };

  const getSensitivityBadge = (sensitivity) => {
    const badges = {
      Low: "success",
      Medium: "warning",
      High: "danger"
    };
    return badges[sensitivity] || "secondary";
  };

  if (!projectId) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Project Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {loading && (
              <div className="d-flex justify-content-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            {project && !loading && (
              <div>
                {/* Project Title */}
                <h4 className="mb-3">{project.title}</h4>

                {/* Organization Info */}
                <div className="card bg-light mb-3">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-building me-2"></i>
                      {project.organization?.name}
                    </h6>
                    {project.organization?.mission && (
                      <p className="card-text small mb-2">
                        <strong>Mission:</strong> {project.organization.mission}
                      </p>
                    )}
                    <div className="row small">
                      {project.organization?.location && (
                        <div className="col-md-6">
                          <i className="bi bi-geo-alt me-1"></i>
                          {project.organization.location}
                        </div>
                      )}
                      {project.organization?.website && (
                        <div className="col-md-6">
                          <i className="bi bi-globe me-1"></i>
                          <a
                            href={project.organization.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                    {project.organization?.focus_areas &&
                      project.organization.focus_areas.length > 0 && (
                        <div className="mt-2">
                          <strong className="small">Focus Areas:</strong>
                          <div className="mt-1">
                            {project.organization.focus_areas.map((area, index) => (
                              <span
                                key={index}
                                className="badge bg-primary me-1 mb-1"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Problem Statement */}
                {project.problem && (
                  <div className="mb-3">
                    <h6>
                      <i className="bi bi-exclamation-circle me-2"></i>
                      Problem Statement
                    </h6>
                    <p>{project.problem}</p>
                  </div>
                )}

                {/* Expected Outcomes */}
                {project.outcomes && (
                  <div className="mb-3">
                    <h6>
                      <i className="bi bi-bullseye me-2"></i>
                      Expected Outcomes
                    </h6>
                    <p>{project.outcomes}</p>
                  </div>
                )}

                {/* Methods Required */}
                {project.methods_required && (
                  <div className="mb-3">
                    <h6>
                      <i className="bi bi-tools me-2"></i>
                      Methods & Expertise Required
                    </h6>
                    <p>{project.methods_required}</p>
                  </div>
                )}

                {/* Project Details Grid */}
                <div className="row g-3">
                  {project.timeline && (
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-clock me-2"></i>
                            Timeline
                          </h6>
                          <p className="card-text">{project.timeline}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {project.budget_min && (
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-currency-dollar me-2"></i>
                            Budget
                          </h6>
                          <p className="card-text">{formatBudget(project.budget_min)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {project.data_sensitivity && (
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-shield-check me-2"></i>
                            Data Sensitivity
                          </h6>
                          <span
                            className={`badge bg-${getSensitivityBadge(
                              project.data_sensitivity
                            )}`}
                          >
                            {project.data_sensitivity}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            {project && (
              <button type="button" className="btn btn-primary">
                <i className="bi bi-envelope me-2"></i>
                Express Interest
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
