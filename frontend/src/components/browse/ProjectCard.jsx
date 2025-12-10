import React from "react";

export default function ProjectCard({ project, onViewDetails }) {
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

  return (
    <div className="card h-100 shadow-sm hover-shadow">
      <div className="card-body">
        {/* Title and Organization */}
        <h5 className="card-title mb-2">{project.title}</h5>
        <p className="text-muted small mb-3">
          <i className="bi bi-building me-1"></i>
          {project.organization?.name}
          {project.organization?.location && (
            <>
              <span className="mx-2">•</span>
              <i className="bi bi-geo-alt me-1"></i>
              {project.organization.location}
            </>
          )}
        </p>

        {/* Problem Statement */}
        {project.problem && (
          <p className="card-text mb-3">
            <strong>Problem:</strong>{" "}
            {project.problem.length > 120
              ? `${project.problem.substring(0, 120)}...`
              : project.problem}
          </p>
        )}

        {/* Methods Required */}
        {project.methods_required && (
          <p className="card-text small mb-2">
            <strong>Methods:</strong>{" "}
            {project.methods_required.length > 100
              ? `${project.methods_required.substring(0, 100)}...`
              : project.methods_required}
          </p>
        )}

        {/* Project Details */}
        <div className="row small text-muted mt-3">
          {project.timeline && (
            <div className="col-6 mb-2">
              <i className="bi bi-clock me-1"></i>
              {project.timeline}
            </div>
          )}
          {project.budget_min && (
            <div className="col-6 mb-2">
              <i className="bi bi-currency-dollar me-1"></i>
              {formatBudget(project.budget_min)}
            </div>
          )}
          {project.data_sensitivity && (
            <div className="col-12 mb-2">
              <i className="bi bi-shield-check me-1"></i>
              Data Sensitivity:{" "}
              <span className={`badge bg-${getSensitivityBadge(project.data_sensitivity)} ms-1`}>
                {project.data_sensitivity}
              </span>
            </div>
          )}
        </div>

        {/* Focus Areas */}
        {project.organization?.focus_areas && project.organization.focus_areas.length > 0 && (
          <div className="mt-3">
            {project.organization.focus_areas.slice(0, 3).map((area, index) => (
              <span key={index} className="badge bg-light text-dark me-1 mb-1">
                {area}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-footer bg-transparent">
        <button
          className="btn btn-primary btn-sm w-100"
          onClick={() => onViewDetails(project.project_id)}
        >
          <i className="bi bi-eye me-2"></i>
          View Full Details
        </button>
      </div>
    </div>
  );
}
