import React, { useState } from "react";
import { getApiUrl } from "../../config/api";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DangerZone() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" to confirm account deletion');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/users/me"), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Account deleted successfully - logout and redirect
      alert(
        data.message ||
          "Account deleted successfully. You can contact support to restore it within 30 days."
      );
      logout();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-danger">Danger Zone</h3>

      <div className="alert alert-danger">
        <h5>Delete Account</h5>
        <p className="mb-0">
          Once you delete your account, all your data will be marked for
          deletion. You can contact support within 30 days to restore your
          account. After 30 days, your data will be permanently deleted.
        </p>
      </div>

      {!showConfirmation ? (
        <button
          className="btn btn-danger"
          onClick={() => setShowConfirmation(true)}
        >
          Delete My Account
        </button>
      ) : (
        <div className="card border-danger">
          <div className="card-body">
            <h5 className="card-title text-danger">
              Are you absolutely sure?
            </h5>
            <p className="card-text">
              This action will soft-delete your account. Your data can be
              recovered within 30 days by contacting support. After that, it
              will be permanently deleted.
            </p>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="confirmText" className="form-label">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                className="form-control"
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={loading || confirmText !== "DELETE"}
              >
                {loading ? "Deleting..." : "I understand, delete my account"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
