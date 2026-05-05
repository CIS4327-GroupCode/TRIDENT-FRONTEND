import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";
import TagInput from "../ui/TagInput";
import {
  ORGANIZATION_TYPE_OPTIONS,
  ORGANIZATION_FOCUS_AREA_OPTIONS,
} from "../../constants/nonprofitOptions";

function parseBudgetRange(value) {
  if (!value || typeof value !== "string") {
    return { min: "", max: "" };
  }

  const matches = value.match(/[\d,.]+/g) || [];
  const numericValues = matches
    .map((item) => Number(item.replace(/,/g, "")))
    .filter((item) => Number.isFinite(item));

  return {
    min: numericValues.length > 0 ? String(Math.trunc(numericValues[0])) : "",
    max: numericValues.length > 1 ? String(Math.trunc(numericValues[1])) : "",
  };
}

function formatCurrency(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return "";
  }

  return `$${Math.trunc(parsed).toLocaleString("en-US")}`;
}

function buildBudgetRangeLabel(min, max) {
  if (!min && !max) {
    return "";
  }

  const formattedMin = formatCurrency(min);
  const formattedMax = formatCurrency(max);

  if (formattedMin && formattedMax) {
    return `${formattedMin} - ${formattedMax}`;
  }

  if (formattedMin) {
    return `From ${formattedMin}`;
  }

  if (formattedMax) {
    return `Up to ${formattedMax}`;
  }

  return "";
}

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
  const [budgetRangeMin, setBudgetRangeMin] = useState("");
  const [budgetRangeMax, setBudgetRangeMax] = useState("");
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

      const parsedRange = parseBudgetRange(org.budget_range);
      setBudgetRangeMin(parsedRange.min);
      setBudgetRangeMax(parsedRange.max);
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
        type: (organization.type || "").trim(),
        website: (organization.website || "").trim(),
        focus_areas: focusAreasInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        budget_range: buildBudgetRangeLabel(budgetRangeMin, budgetRangeMax),
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
        setFocusAreasInput(
          Array.isArray(data.organization.focus_areas)
            ? data.organization.focus_areas.join(", ")
            : ""
        );
        const parsedRange = parseBudgetRange(data.organization.budget_range);
        setBudgetRangeMin(parsedRange.min);
        setBudgetRangeMax(parsedRange.max);
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
          <select
            className="form-control"
            id="type"
            value={organization.type}
            onChange={(e) =>
              setOrganization({ ...organization, type: e.target.value })
            }
          >
            <option value="">Select organization type</option>
            {ORGANIZATION_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
            type="text"
            className="form-control"
            id="website"
            value={organization.website}
            onChange={(e) =>
              setOrganization({ ...organization, website: e.target.value })
            }
            placeholder="example.org or www.example.org"
          />
          <div className="form-text">Protocol is optional. We will normalize it automatically.</div>
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
          <TagInput
            id="focus_areas"
            value={focusAreasInput}
            onChange={setFocusAreasInput}
            options={ORGANIZATION_FOCUS_AREA_OPTIONS}
            placeholder="Select or type focus areas"
          />
          <div className="form-text">Use predefined focus areas or add custom ones.</div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="budget_range" className="form-label">
              Budget Range (USD)
            </label>
            <div className="row g-2">
              <div className="col-6">
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-control"
                    id="budget_range_min"
                    value={budgetRangeMin}
                    onChange={(e) => setBudgetRangeMin(e.target.value)}
                    placeholder="Min"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-control"
                    id="budget_range_max"
                    value={budgetRangeMax}
                    onChange={(e) => setBudgetRangeMax(e.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            <div className="form-text">Saved as: {buildBudgetRangeLabel(budgetRangeMin, budgetRangeMax) || "Not set"}</div>
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
