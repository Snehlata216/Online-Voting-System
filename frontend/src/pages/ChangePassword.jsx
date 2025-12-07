// src/pages/ChangePassword.jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./ChangePassword.css";

export default function ChangePassword() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.voterId) {
      navigate("/login");
    }
  }, [user, navigate]);

  const validate = () => {
    const next = {};
    if (!oldPassword) next.oldPassword = "Enter your current password.";
    if (!newPassword) next.newPassword = "Enter a new password.";
    else if (newPassword.length < 8) next.newPassword = "New password must be at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your new password.";
    else if (newPassword && confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/voters/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: user.voterId,
          oldPassword,
          newPassword
        })
      });

      if (!res.ok) {
        const text = await res.text();
        setStatus(text || "Failed to change password.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStatus("✅ Password changed successfully.");
      // Clear fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect back to profile after short delay
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      console.error("Change password error:", err);
      setStatus("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-page">
      <div className="change-card">
        <h1 className="change-heading">Change Password</h1>
        <p className="change-sub">Update your account password securely</p>

        {status && <div className="status-msg">{status}</div>}

        <form className="change-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-row">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`input ${errors.oldPassword ? "input-error" : ""}`}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowOld((s) => !s)}
                aria-label="Toggle current password visibility"
              >
                {showOld ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.oldPassword && <div className="error-msg">{errors.oldPassword}</div>}
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="password-row">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`input ${errors.newPassword ? "input-error" : ""}`}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowNew((s) => !s)}
                aria-label="Toggle new password visibility"
              >
                {showNew ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.newPassword && <div className="error-msg">{errors.newPassword}</div>}
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-row">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.confirmPassword && <div className="error-msg">{errors.confirmPassword}</div>}
          </div>

          <div className="action-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/profile")}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Saving..." : "Change Password"}
            </button>
          </div>

          <div className="note-row">
            <small>Tip: Use a strong password with letters, numbers, and symbols.</small>
          </div>
        </form>
      </div>
    </div>
  );
}
