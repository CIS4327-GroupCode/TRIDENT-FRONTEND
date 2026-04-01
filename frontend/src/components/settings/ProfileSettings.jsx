import React, { useState, useEffect } from "react";
import { getApiUrl, fetchApiWithAuth } from "../../config/api";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ProfileSettings({ user }) {
  const { setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [twofaCode, setTwofaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFA || false);
  // 2FA flow: "idle" | "sending" | "codeSent"
  const [tfaFlow, setTfaFlow] = useState("idle");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setTwoFAEnabled(user.twoFA || false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("trident_token");
      const response = await fetch(getApiUrl("/api/users/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(
        data.emailVerificationSent
          ? "Profile updated. Verification email sent to your new address."
          : "Profile updated successfully!"
      );
      
      // Update user in context and localStorage
      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem("trident_user", JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend2FACode = async () => {
    const endpoint = twoFAEnabled ? "/auth/2fa/send-disable" : "/auth/2fa/send-enable";
    setTfaFlow("sending");
    try {
      const token = localStorage.getItem("trident_token");
      const res = await fetchApiWithAuth(endpoint, { method: "POST" }, token);
      toast.info(res?.message || "Code sent to your email.");
      setTfaFlow("codeSent");
    } catch (err) {
      toast.error(err?.message || "Failed to send code. Try again.");
      setTfaFlow("idle");
    }
  };

  const handleVerify2FA = async () => {
    const endpoint = twoFAEnabled ? "/auth/2fa/verify-disable" : "/auth/2fa/verify-enable";
    try {
      const token = localStorage.getItem("trident_token");
      const res = await fetchApiWithAuth(endpoint, {
        method: "POST",
        body: JSON.stringify({ code: twofaCode })
      }, token);

      const newState = !twoFAEnabled;
      setTwoFAEnabled(newState);

      // Update auth context + localStorage
      const updatedUser = { ...user, twoFA: newState };
      setUser(updatedUser);
      localStorage.setItem("trident_user", JSON.stringify(updatedUser));

      toast.success(res?.message || (newState ? "2FA enabled." : "2FA disabled."));
      setTwofaCode("");
      setTfaFlow("idle");
    } catch (err) {
      toast.error(err?.message || "Invalid or expired code.");
    }
  };
  
  return (
    <div>
      <h3 className="mb-4">Profile Information</h3>

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
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="form-text">
            Changing your email may require verification.
          </div>
        </div>
          
        <div className="mb-3">
          <label className="form-label">Two-Factor Authentication</label>

          {twoFAEnabled && tfaFlow === "idle" && (
            <div>
              <span className="badge bg-success me-2">
                <i className="bi bi-shield-check me-1"></i>Enabled
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleSend2FACode}
              >
                Disable 2FA
              </button>
            </div>
          )}

          {!twoFAEnabled && tfaFlow === "idle" && (
            <>
              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSend2FACode}
                >
                  Enable 2FA
                </button>
              </div>
              <div className="form-text">
                Add an extra layer of security by requiring a verification code at login.
              </div>
            </>
          )}

          {tfaFlow === "sending" && (
            <div>
              <button type="button" className="btn btn-secondary btn-sm" disabled>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Sending code...
              </button>
            </div>
          )}

          {tfaFlow === "codeSent" && (
            <>
              <div className="form-text mb-2">
                A 6-digit code has been sent to your email. Enter it below.
              </div>
              <input
                type="text"
                className="form-control mt-2"
                placeholder="Enter 6-digit code"
                value={twofaCode}
                onChange={(e) => setTwofaCode(e.target.value)}
                maxLength={6}
                autoFocus
              />
              <div className="d-flex gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleVerify2FA}
                  disabled={!twofaCode.trim()}
                >
                  Verify Code
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => { setTfaFlow("idle"); setTwofaCode(""); }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Role</label>
          <input
            type="text"
            className="form-control"
            value={user?.role || ""}
            disabled
          />
          <div className="form-text">Your account role cannot be changed.</div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
