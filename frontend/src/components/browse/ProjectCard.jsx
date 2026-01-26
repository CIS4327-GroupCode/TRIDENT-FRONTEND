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
    <div className="featured-card">
      <div>
        <h5 className="mb-2 fw-700 text-gray-900">{project.title}</h5>
        <p className="text-muted small mb-3">
          <span className="pill pill-gray">{project.organization?.name}</span>
          {project.organization?.location && (
            <span className="ms-2 text-gray-600">📍 {project.organization.location}</span>
          )}
        </p>

        {project.problem && (
          <p className="card-text small mb-2 text-gray-700">
            {project.problem.length > 120
              ? `${project.problem.substring(0, 120)}...`
              : project.problem}
          </p>
        )}

        {project.methods_required && (
          <p className="card-text small mb-2 text-gray-600">
            <strong>Methods:</strong>{" "}
            {project.methods_required.length > 100
              ? `${project.methods_required.substring(0, 100)}...`
              : project.methods_required}
          </p>
        )}

        <div className="d-flex flex-wrap gap-2 my-3">
          {project.timeline && (
            <span className="tag">⏱️ {project.timeline}</span>
          )}
          {project.budget_min && (
            <span className="tag">💰 {formatBudget(project.budget_min)}</span>
          )}
          {project.data_sensitivity && (
            <span className="tag">
              🔒 {project.data_sensitivity}
            </span>
          )}
        </div>

        {project.organization?.focus_areas && project.organization.focus_areas.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {project.organization.focus_areas.slice(0, 3).map((area, index) => (
              <span key={index} className="pill pill-mint small">{area}</span>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-gradient btn-sm w-100 mt-auto"
        onClick={() => onViewDetails(project.project_id)}
      >
        View Full Details →
      </button>
    </div>
  );
}
