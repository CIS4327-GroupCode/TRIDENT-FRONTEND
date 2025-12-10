import React, { useState, useEffect } from "react";

export default function ResearcherSettings() {
  const [profile, setProfile] = useState({
    title: "",
    institution: "",
    expertise: [],
    research_interests: [],
    bio: "",
    projects_completed: 0,
    hourly_rate_min: "",
    hourly_rate_max: "",
    available_hours: "",
    preferred_project_types: [],
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");
  const [projectTypesInput, setProjectTypesInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch("/api/researchers/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch researcher profile");
      }

      setProfile(data.profile);
      setExpertiseInput(
        Array.isArray(data.profile.expertise)
          ? data.profile.expertise.join(", ")
          : ""
      );
      setInterestsInput(
        Array.isArray(data.profile.research_interests)
          ? data.profile.research_interests.join(", ")
          : ""
      );
      setProjectTypesInput(
        Array.isArray(data.profile.preferred_project_types)
          ? data.profile.preferred_project_types.join(", ")
          : ""
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        ...profile,
        expertise: expertiseInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        research_interests: interestsInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        preferred_project_types: projectTypesInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        hourly_rate_min: profile.hourly_rate_min
          ? parseFloat(profile.hourly_rate_min)
          : undefined,
        hourly_rate_max: profile.hourly_rate_max
          ? parseFloat(profile.hourly_rate_max)
          : undefined,
        available_hours: profile.available_hours
          ? parseFloat(profile.available_hours)
          : undefined,
      };

      const response = await fetch("/api/researchers/me", {
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
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Professional Title
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
          <label htmlFor="institution" className="form-label">
            Institution/Affiliation
          </label>
          <input
            type="text"
            className="form-control"
            id="institution"
            value={profile.institution}
            onChange={(e) =>
              setProfile({ ...profile, institution: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label htmlFor="expertise" className="form-label">
            Areas of Expertise
          </label>
          <input
            type="text"
            className="form-control"
            id="expertise"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            placeholder="e.g., Machine Learning, Statistics, Data Science (comma-separated)"
          />
          <div className="form-text">
            Enter your areas of expertise separated by commas.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="research_interests" className="form-label">
            Research Interests
          </label>
          <input
            type="text"
            className="form-control"
            id="research_interests"
            value={interestsInput}
            onChange={(e) => setInterestsInput(e.target.value)}
            placeholder="e.g., AI Ethics, Public Health, Climate Change (comma-separated)"
          />
          <div className="form-text">
            Enter your research interests separated by commas.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="bio" className="form-label">
            Professional Bio
          </label>
          <textarea
            className="form-control"
            id="bio"
            rows="4"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell organizations about your background and experience..."
          />
        </div>

        <div className="mb-3">
          <label htmlFor="preferred_project_types" className="form-label">
            Preferred Project Types
          </label>
          <input
            type="text"
            className="form-control"
            id="preferred_project_types"
            value={projectTypesInput}
            onChange={(e) => setProjectTypesInput(e.target.value)}
            placeholder="e.g., Research, Consulting, Analysis (comma-separated)"
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="hourly_rate_min" className="form-label">
              Minimum Hourly Rate ($)
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
          <label htmlFor="available_hours" className="form-label">
            Available Hours per Week
          </label>
          <input
            type="number"
            className="form-control"
            id="available_hours"
            value={profile.available_hours}
            onChange={(e) =>
              setProfile({ ...profile, available_hours: e.target.value })
            }
            min="0"
            step="0.5"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="projects_completed" className="form-label">
            Projects Completed
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
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
