import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

export default function OrganizationSettings() {
  const [organization, setOrganization] = useState({
    name: "",
    type: "",
    location: "",
    website: "",
    mission: "",
    focus_areas: [],
    budget_range: "",
    team_size: "",
    established_year: "",
  });
  const [focusAreasInput, setFocusAreasInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/organizations/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch organization");
      }
  
      // 👉 Support both shapes:
      //    - { organization: {...} }
      //    - {...} (plain org object)
      let org = data.organization ?? data;
  
      // 👉 If still nothing, fall back to an empty org object
      if (!org) {
        org = {
          name: "",
          type: "",
          location: "",
          website: "",
          mission: "",
          focus_areas: [],
          budget_range: "",
          team_size: "",
          established_year: "",
        };
      }
  
      setOrganization(org);
  
      setFocusAreasInput(
        Array.isArray(org.focus_areas) ? org.focus_areas.join(", ") : ""
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
    setSaving(true);
  
    try {
      const token = localStorage.getItem("trident_token");
      const payload = {
        ...organization,
        focus_areas: focusAreasInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
  
      const response = await fetch(getApiUrl("/api/organizations/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      // 🛡️ Safely attempt JSON parsing
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null; // Empty or invalid JSON
      }
  
      if (!response.ok) {
        const message = data?.error || "Failed to update organization";
        throw new Error(message);
      }
  
      // 🛠️ Update local state only if backend sent data
      if (data?.organization) {
        setOrganization(data.organization);
      }
  
      setSuccess("Organization updated successfully!");
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
      <h3 className="mb-4">Organization Settings</h3>

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
          <label htmlFor="name" className="form-label">
            Organization Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={organization.name}
            onChange={(e) =>
              setOrganization({ ...organization, name: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label htmlFor="type" className="form-label">
            Organization Type
          </label>
          <input
            type="text"
            className="form-control"
            id="type"
            value={organization.type}
            onChange={(e) =>
              setOrganization({ ...organization, type: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            type="text"
            className="form-control"
            id="location"
            value={organization.location}
            onChange={(e) =>
              setOrganization({ ...organization, location: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label htmlFor="website" className="form-label">
            Website
          </label>
          <input
            type="url"
            className="form-control"
            id="website"
            value={organization.website}
            onChange={(e) =>
              setOrganization({ ...organization, website: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label htmlFor="mission" className="form-label">
            Mission Statement
          </label>
          <textarea
            className="form-control"
            id="mission"
            rows="3"
            value={organization.mission}
            onChange={(e) =>
              setOrganization({ ...organization, mission: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label htmlFor="focus_areas" className="form-label">
            Focus Areas
          </label>
          <input
            type="text"
            className="form-control"
            id="focus_areas"
            value={focusAreasInput}
            onChange={(e) => setFocusAreasInput(e.target.value)}
            placeholder="e.g., Education, Health, Environment (comma-separated)"
          />
          <div className="form-text">
            Enter focus areas separated by commas.
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="budget_range" className="form-label">
              Budget Range
            </label>
            <input
              type="text"
              className="form-control"
              id="budget_range"
              value={organization.budget_range}
              onChange={(e) =>
                setOrganization({
                  ...organization,
                  budget_range: e.target.value,
                })
              }
              placeholder="e.g., $100,000 - $500,000"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="team_size" className="form-label">
              Team Size
            </label>
            <input
              type="number"
              className="form-control"
              id="team_size"
              value={organization.team_size}
              onChange={(e) =>
                setOrganization({
                  ...organization,
                  team_size: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="established_year" className="form-label">
            Established Year
          </label>
          <input
            type="number"
            className="form-control"
            id="established_year"
            value={organization.established_year}
            onChange={(e) =>
              setOrganization({
                ...organization,
                established_year: e.target.value,
              })
            }
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
