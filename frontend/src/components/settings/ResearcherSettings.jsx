import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

/**
 * Parse comma-separated string into array
 */
function parseCommaSeparated(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Calculate profile completeness percentage
 */
function computeCompleteness(profile, expertiseInput, domainsInput, methodsInput) {
  const fields = [
    { check: () => !!profile.affiliation },
    { check: () => !!profile.title },
    { check: () => parseCommaSeparated(expertiseInput).length > 0 },
    { check: () => parseCommaSeparated(domainsInput).length > 0 },
    { check: () => parseCommaSeparated(methodsInput).length > 0 },
    { check: () => !!profile.hourly_rate_min && parseFloat(profile.hourly_rate_min) > 0 },
    { check: () => profile.research_interests && profile.research_interests.length >= 20 },
    { check: () => !!profile.availability },
  ];
  const filled = fields.filter(f => f.check()).length;
  return Math.round((filled / fields.length) * 100);
}

export default function ResearcherSettings() {
  const [profile, setProfile] = useState({
    title: "",
    affiliation: "",
    institution: "",
    domains: "",
    methods: "",
    tools: "",
    expertise: "",
    research_interests: "",
    compliance_certifications: "",
    projects_completed: 0,
    hourly_rate_min: "",
    hourly_rate_max: "",
    availability: "",
    max_concurrent_projects: 3,
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [domainsInput, setDomainsInput] = useState("");
  const [methodsInput, setMethodsInput] = useState("");
  const [toolsInput, setToolsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/researchers/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch researcher profile");
      }

      setProfile(data.profile);
      setExpertiseInput(data.profile.expertise || "");
      setDomainsInput(data.profile.domains || "");
      setMethodsInput(data.profile.methods || "");
      setToolsInput(data.profile.tools || "");
      
      if (data.completeness !== undefined) {
        setCompleteness(data.completeness);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update completeness when inputs change
  useEffect(() => {
    const newCompleteness = computeCompleteness(profile, expertiseInput, domainsInput, methodsInput);
    setCompleteness(newCompleteness);
  }, [profile, expertiseInput, domainsInput, methodsInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate rate range
    const minRate = parseFloat(profile.hourly_rate_min);
    const maxRate = parseFloat(profile.hourly_rate_max);
    if (minRate && maxRate && minRate > maxRate) {
      setError("Minimum rate cannot exceed maximum rate");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("trident_token");
      const payload = {
        title: profile.title,
        affiliation: profile.affiliation,
        institution: profile.institution,
        domains: domainsInput,
        methods: methodsInput,
        tools: toolsInput,
        expertise: expertiseInput,
        research_interests: profile.research_interests,
        compliance_certifications: profile.compliance_certifications,
        projects_completed: profile.projects_completed ? parseInt(profile.projects_completed) : 0,
        hourly_rate_min: profile.hourly_rate_min ? parseFloat(profile.hourly_rate_min) : undefined,
        hourly_rate_max: profile.hourly_rate_max ? parseFloat(profile.hourly_rate_max) : undefined,
        availability: profile.availability,
        max_concurrent_projects: profile.max_concurrent_projects ? parseInt(profile.max_concurrent_projects) : 3,
      };

      const response = await fetch(getApiUrl("/api/researchers/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update researcher profile");
      }

      setSuccess("Researcher profile updated successfully!");
      setProfile(data.profile);
      
      if (data.completeness !== undefined) {
        setCompleteness(data.completeness);
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4">Researcher Profile Settings</h3>

      {/* Profile Completeness Bar */}
      <div className="mb-4 p-3 bg-light rounded">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Profile Completeness</span>
          <span className={`fw-bold ${completeness >= 80 ? 'text-success' : 'text-warning'}`}>
            {completeness}%
          </span>
        </div>
        <div className="progress mb-2" style={{ height: '8px' }}>
          <div
            className={`progress-bar ${completeness >= 80 ? 'bg-success' : 'bg-warning'}`}
            style={{ width: `${completeness}%`, transition: 'width 0.3s ease' }}
          />
        </div>
        {completeness < 80 ? (
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Complete at least 80% to improve your visibility in match results. Incomplete profiles score lower in the matching algorithm.
          </small>
        ) : (
          <small className="text-success">
            <i className="bi bi-check-circle me-1"></i>
            Profile is complete — you'll score well in match results!
          </small>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Identity Section */}
        <h5 className="mt-4 mb-3 text-primary">
          <i className="bi bi-person-badge me-2"></i>
          Identity
        </h5>

        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Professional Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={profile.title}
            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            placeholder="e.g., PhD Candidate, Professor, Research Scientist"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="affiliation" className="form-label">
            Affiliation <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="affiliation"
            value={profile.affiliation}
            onChange={(e) =>
              setProfile({ ...profile, affiliation: e.target.value })
            }
            placeholder="e.g., PhD student, Independent researcher, Professor"
          />
          <div className="form-text">
            Your academic or professional role/status.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="institution" className="form-label">
            Institution
          </label>
          <input
            type="text"
            className="form-control"
            id="institution"
            value={profile.institution}
            onChange={(e) =>
              setProfile({ ...profile, institution: e.target.value })
            }
            placeholder="e.g., Harvard University, MIT, Independent"
          />
        </div>

        <hr className="my-4" />

        {/* Research Profile Section */}
        <h5 className="mt-4 mb-3 text-primary">
          <i className="bi bi-book me-2"></i>
          Research Profile
        </h5>

        <div className="mb-3">
          <label htmlFor="expertise" className="form-label">
            Areas of Expertise <span className="text-danger">*</span>
            <span className="badge bg-info ms-2" title="Worth 30 points in matching">30 pts</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="expertise"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            placeholder="e.g., Machine Learning, Statistics, Data Science"
          />
          <div className="form-text">
            Enter your areas of expertise separated by commas. This is the most important matching signal.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="domains" className="form-label">
            Research Domains <span className="text-danger">*</span>
            <span className="badge bg-info ms-2" title="Worth 10 points in matching">10 pts</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="domains"
            value={domainsInput}
            onChange={(e) => setDomainsInput(e.target.value)}
            placeholder="e.g., Public Health, Climate Science, Education"
          />
          <div className="form-text">
            Fields or domains you work in, separated by commas.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="methods" className="form-label">
            Research Methods <span className="text-danger">*</span>
            <span className="badge bg-info ms-2" title="Worth 25 points in matching">25 pts</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="methods"
            value={methodsInput}
            onChange={(e) => setMethodsInput(e.target.value)}
            placeholder="e.g., Qualitative Research, Quantitative Analysis, Mixed Methods"
          />
          <div className="form-text">
            Research methodologies you're skilled in, separated by commas.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="tools" className="form-label">
            Tools & Technologies
          </label>
          <input
            type="text"
            className="form-control"
            id="tools"
            value={toolsInput}
            onChange={(e) => setToolsInput(e.target.value)}
            placeholder="e.g., Python, R, SPSS, Stata, NVivo, Tableau"
          />
          <div className="form-text">
            Software, programming languages, and tools, separated by commas.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="research_interests" className="form-label">
            Research Interests <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            id="research_interests"
            rows="3"
            value={profile.research_interests}
            onChange={(e) => setProfile({ ...profile, research_interests: e.target.value })}
            placeholder="Describe your research interests, focus areas, and what types of projects you're looking for..."
          />
          <div className="form-text">
            At least 20 characters. This helps nonprofits understand your focus.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="compliance_certifications" className="form-label">
            IRB / Ethics Certifications
          </label>
          <textarea
            className="form-control"
            id="compliance_certifications"
            rows="2"
            value={profile.compliance_certifications}
            onChange={(e) =>
              setProfile({ ...profile, compliance_certifications: e.target.value })
            }
            placeholder="e.g., CITI Human Subjects Research, IRB certification, Ethics training"
          />
          <div className="form-text">
            Compliance certifications, ethics training, or IRB approvals.
          </div>
        </div>

        <hr className="my-4" />

        {/* Availability & Rates Section */}
        <h5 className="mt-4 mb-3 text-primary">
          <i className="bi bi-calendar-check me-2"></i>
          Availability & Rates
        </h5>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="hourly_rate_min" className="form-label">
              Minimum Hourly Rate ($) <span className="text-danger">*</span>
              <span className="badge bg-info ms-2" title="Worth 15 points in matching">15 pts</span>
            </label>
            <input
              type="number"
              className="form-control"
              id="hourly_rate_min"
              value={profile.hourly_rate_min}
              onChange={(e) =>
                setProfile({ ...profile, hourly_rate_min: e.target.value })
              }
              min="0"
              step="0.01"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="hourly_rate_max" className="form-label">
              Maximum Hourly Rate ($)
            </label>
            <input
              type="number"
              className="form-control"
              id="hourly_rate_max"
              value={profile.hourly_rate_max}
              onChange={(e) =>
                setProfile({ ...profile, hourly_rate_max: e.target.value })
              }
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="availability" className="form-label">
            Availability <span className="text-danger">*</span>
            <span className="badge bg-info ms-2" title="Worth 10 points in matching">10 pts</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="availability"
            value={profile.availability}
            onChange={(e) =>
              setProfile({ ...profile, availability: e.target.value })
            }
            placeholder="e.g., 10-20 hours/week, Full-time, Flexible"
          />
          <div className="form-text">
            How many hours per week or your availability schedule.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="max_concurrent_projects" className="form-label">
            Maximum Concurrent Projects
          </label>
          <input
            type="number"
            className="form-control"
            id="max_concurrent_projects"
            value={profile.max_concurrent_projects}
            onChange={(e) =>
              setProfile({ ...profile, max_concurrent_projects: e.target.value })
            }
            min="1"
            max="10"
          />
          <div className="form-text">
            Maximum number of projects you can handle simultaneously.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="projects_completed" className="form-label">
            Projects Completed
            <span className="badge bg-info ms-2" title="Worth 10 points in matching">10 pts</span>
          </label>
          <input
            type="number"
            className="form-control"
            id="projects_completed"
            value={profile.projects_completed}
            onChange={(e) =>
              setProfile({ ...profile, projects_completed: e.target.value })
            }
            min="0"
          />
          <div className="form-text">
            Number of completed research projects or collaborations.
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
