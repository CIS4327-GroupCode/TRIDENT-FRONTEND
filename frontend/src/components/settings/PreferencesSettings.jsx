import React, { useState, useEffect } from "react";
import { getApiUrl } from "../../config/api";

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    email_messages: true,
    email_matches: true,
    email_milestones: true,
    email_project_updates: true,
    inapp_notifications: true,
    inapp_messages: true,
    inapp_matches: true,
    weekly_digest: false,
    monthly_report: false,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/users/me/preferences"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch preferences");
      }

      setPreferences(data.preferences);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/users/me/preferences"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update preferences");
      }

      setSuccess("Preferences updated successfully!");
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
      <h3 className="mb-4">Notification Preferences</h3>

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
        {/* Email Notifications Section */}
        <h5 className="mb-3">Email Notifications</h5>
        <div className="mb-3">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="email_notifications"
              checked={preferences.email_notifications}
              onChange={() => handleToggle("email_notifications")}
            />
            <label className="form-check-label" htmlFor="email_notifications">
              Enable email notifications
            </label>
          </div>
          <div className="form-check form-switch mb-2 ms-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="email_messages"
              checked={preferences.email_messages}
              onChange={() => handleToggle("email_messages")}
              disabled={!preferences.email_notifications}
            />
            <label className="form-check-label" htmlFor="email_messages">
              New messages
            </label>
          </div>
          <div className="form-check form-switch mb-2 ms-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="email_matches"
              checked={preferences.email_matches}
              onChange={() => handleToggle("email_matches")}
              disabled={!preferences.email_notifications}
            />
            <label className="form-check-label" htmlFor="email_matches">
              New matches
            </label>
          </div>
          <div className="form-check form-switch mb-2 ms-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="email_milestones"
              checked={preferences.email_milestones}
              onChange={() => handleToggle("email_milestones")}
              disabled={!preferences.email_notifications}
            />
            <label className="form-check-label" htmlFor="email_milestones">
              Milestone reminders
            </label>
          </div>
          <div className="form-check form-switch mb-2 ms-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="email_project_updates"
              checked={preferences.email_project_updates}
              onChange={() => handleToggle("email_project_updates")}
              disabled={!preferences.email_notifications}
            />
            <label
              className="form-check-label"
              htmlFor="email_project_updates"
            >
              Project updates
            </label>
          </div>
        </div>

        <hr />

        {/* In-App Notifications Section */}
        <h5 className="mb-3">In-App Notifications</h5>
        <div className="mb-3">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="inapp_notifications"
              checked={preferences.inapp_notifications}
              onChange={() => handleToggle("inapp_notifications")}
            />
            <label className="form-check-label" htmlFor="inapp_notifications">
              Enable in-app notifications
            </label>
          </div>
          <div className="form-check form-switch mb-2 ms-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="inapp_messages"
              checked={preferences.inapp_messages}
              onChange={() => handleToggle("inapp_messages")}
              disabled={!preferences.inapp_notifications}
            />
            <label className="form-check-label" htmlFor="inapp_messages">
              New messages
            </label>
          </div>
          <div className="form-check form-switch mb-2 ms-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="inapp_matches"
              checked={preferences.inapp_matches}
              onChange={() => handleToggle("inapp_matches")}
              disabled={!preferences.inapp_notifications}
            />
            <label className="form-check-label" htmlFor="inapp_matches">
              New matches
            </label>
          </div>
        </div>

        <hr />

        {/* Digest Notifications Section */}
        <h5 className="mb-3">Digest & Reports</h5>
        <div className="mb-3">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="weekly_digest"
              checked={preferences.weekly_digest}
              onChange={() => handleToggle("weekly_digest")}
            />
            <label className="form-check-label" htmlFor="weekly_digest">
              Weekly activity digest
            </label>
          </div>
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="monthly_report"
              checked={preferences.monthly_report}
              onChange={() => handleToggle("monthly_report")}
            />
            <label className="form-check-label" htmlFor="monthly_report">
              Monthly summary report
            </label>
          </div>
        </div>

        <hr />

        {/* Marketing Section */}
        <h5 className="mb-3">Marketing</h5>
        <div className="mb-3">
          <div className="form-check form-switch mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="marketing_emails"
              checked={preferences.marketing_emails}
              onChange={() => handleToggle("marketing_emails")}
            />
            <label className="form-check-label" htmlFor="marketing_emails">
              Receive marketing and promotional emails
            </label>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}
