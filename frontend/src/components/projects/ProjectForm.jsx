import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

export default function ProjectForm({ projectId, onSuccess, onCancel }) {
  const [project, setProject] = useState({
    title: "",
    problem: "",
    outcomes: "",
    methods_required: "",
    timeline: "",
    budget_min: "",
    data_sensitivity: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!projectId;

  useEffect(() => {
    if (isEditMode) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl(`/api/projects/${projectId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch project");
      }

      setProject(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const token = localStorage.getItem("trident_token");
      const url = isEditMode ? getApiUrl(`/api/projects/${projectId}`) : getApiUrl("/api/projects");
      const method = isEditMode ? "PUT" : "POST";

      // Convert budget to number if provided
      const payload = {
        ...project,
        budget_min: project.budget_min ? parseFloat(project.budget_min) : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} project`);
      }

      if (onSuccess) {
        onSuccess(data.project);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-4">
          {isEditMode ? "Edit Project" : "Create New Project"}
        </h5>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Project Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              name="title"
              value={project.title}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="Enter a descriptive project title"
            />
          </div>

          {/* Problem */}
          <div className="mb-3">
            <label htmlFor="problem" className="form-label">
              Problem Statement
            </label>
            <textarea
              className="form-control"
              id="problem"
              name="problem"
              value={project.problem}
              onChange={handleChange}
              rows={3}
              maxLength={255}
              placeholder="Describe the problem or need this project addresses"
            />
            <div className="form-text">
              Clearly articulate the challenge your organization is facing
            </div>
          </div>

          {/* Outcomes */}
          <div className="mb-3">
            <label htmlFor="outcomes" className="form-label">
              Expected Outcomes
            </label>
            <textarea
              className="form-control"
              id="outcomes"
              name="outcomes"
              value={project.outcomes}
              onChange={handleChange}
              rows={3}
              maxLength={255}
              placeholder="What deliverables or results do you expect?"
            />
            <div className="form-text">
              Describe what success looks like for this project
            </div>
          </div>

          {/* Methods Required */}
          <div className="mb-3">
            <label htmlFor="methods_required" className="form-label">
              Methods & Expertise Required
            </label>
            <textarea
              className="form-control"
              id="methods_required"
              name="methods_required"
              value={project.methods_required}
              onChange={handleChange}
              rows={3}
              maxLength={255}
              placeholder="e.g., Survey design, statistical analysis, qualitative interviews"
            />
            <div className="form-text">
              List the research methods and skills needed
            </div>
          </div>

          <div className="row">
            {/* Timeline */}
            <div className="col-md-6 mb-3">
              <label htmlFor="timeline" className="form-label">
                Timeline
              </label>
              <input
                type="text"
                className="form-control"
                id="timeline"
                name="timeline"
                value={project.timeline}
                onChange={handleChange}
                maxLength={255}
                placeholder="e.g., 6 months, Q1 2025"
              />
              <div className="form-text">
                When should this project be completed?
              </div>
            </div>

            {/* Budget */}
            <div className="col-md-6 mb-3">
              <label htmlFor="budget_min" className="form-label">
                Budget (USD)
              </label>
              <input
                type="number"
                className="form-control"
                id="budget_min"
                name="budget_min"
                value={project.budget_min}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 10000"
              />
              <div className="form-text">
                Minimum budget available for this project
              </div>
            </div>
          </div>

          <div className="row">
            {/* Data Sensitivity */}
            <div className="col-md-6 mb-3">
              <label htmlFor="data_sensitivity" className="form-label">
                Data Sensitivity
              </label>
              <select
                className="form-select"
                id="data_sensitivity"
                name="data_sensitivity"
                value={project.data_sensitivity}
                onChange={handleChange}
              >
                <option value="">Select sensitivity level</option>
                <option value="Low">Low - Public data only</option>
                <option value="Medium">Medium - Some confidential data</option>
                <option value="High">High - Highly sensitive data</option>
              </select>
              <div className="form-text">
                Level of data sensitivity involved
              </div>
            </div>

            {/* Status */}
            <div className="col-md-6 mb-3">
              <label htmlFor="status" className="form-label">
                Project Status
              </label>
              <select
                className="form-select"
                id="status"
                name="status"
                value={project.status}
                onChange={handleChange}
              >
                <option value="draft">Draft - Not visible to researchers</option>
                <option value="open">Open - Accepting applications</option>
                <option value="in_progress">In Progress - Work underway</option>
                <option value="completed">Completed - Project finished</option>
                <option value="cancelled">Cancelled - Project cancelled</option>
              </select>
              <div className="form-text">
                Control project visibility and status
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !project.title.trim()}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditMode ? "Update Project" : "Create Project"}</>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
