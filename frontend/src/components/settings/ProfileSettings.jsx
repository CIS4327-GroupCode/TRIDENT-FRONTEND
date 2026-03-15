import React, { useState, useEffect } from "react";
import { getApiUrl, fetchApiWithAuth } from "../../config/api";
import { useAuth } from "../../auth/AuthContext";

export default function ProfileSettings({ user }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [twofaCode, setTwofaCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
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
    try {
      const res = await fetchApiWithAuth("/auth/2fa/send-enable", {
        method: "POST",
      });
      alert(res?.message || "2FA code sent to your email.");
    } catch (err) {
      alert("Email sent. Check your inbox for the verification code.");
    }
  };

  const handleVerify2FA = async () => {
    try {
      const res = await fetchApiWithAuth("/auth/2fa/verify-enable", {
        method: "POST",
        body: { code: twofaCode }
      });
      alert(res.message);
    } catch (err) {
      alert("Invalid or expired code.");
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

          <input
            type="text"
            className="form-control mt-2"
            placeholder="Enter 6-digit code"
            value={twofaCode}
            onChange={(e) => setTwofaCode(e.target.value)}
          />

          <button
            type="button"
            className="btn btn-success btn-sm mt-2"
            onClick={handleVerify2FA}
            disabled={!twofaCode.trim()}
          >
            Verify Code
          </button>
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
