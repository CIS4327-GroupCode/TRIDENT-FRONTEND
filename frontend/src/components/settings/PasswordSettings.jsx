import React, { useState } from "react";
import { getApiUrl } from "../../config/api";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function getPasswordChecks(password) {
  const value = String(password || "");
  return {
    minLength: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

function meetsPolicy(password) {
  const checks = getPasswordChecks(password);
  return Object.values(checks).every(Boolean);
}

export default function PasswordSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!meetsPolicy(newPassword)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/users/me/password"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (data.requireReLogin) {
        setTimeout(() => {
          logout();
          navigate("/");
        }, 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checks = getPasswordChecks(newPassword);
  const checkItems = [
    ["At least 8 characters", checks.minLength],
    ["One uppercase letter", checks.uppercase],
    ["One lowercase letter", checks.lowercase],
    ["One number", checks.number],
    ["One special character", checks.special],
  ];

  return (
    <div>
      <h3 className="mb-4">Change Password</h3>

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
          <label htmlFor="currentPassword" className="form-label">
            Current Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            className="form-control"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="form-text">
            Use a strong password that meets all security requirements.
          </div>
          <ul className="list-unstyled small mt-2 mb-0" aria-label="Password strength checks">
            {checkItems.map(([label, ok]) => (
              <li key={label} className={ok ? "text-success" : "text-muted"}>
                {ok ? "[x]" : "[ ]"} {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="showPasswords"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="showPasswords">
            Show passwords
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
