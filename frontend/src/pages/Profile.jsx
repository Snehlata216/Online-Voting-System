// src/pages/Profile.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const { user, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Which fields are visible and editable
  const visibleFields = useMemo(
    () => [
      "voterId",       // read-only
      "name",
      "email",
      "address",
      "age",
      "gender",
      "citizenship",
      "residency",
    ],
    []
  );

  const readOnlyFields = useMemo(() => ["voterId"], []);

  useEffect(() => {
    if (!user?.voterId) {
      navigate("/login");
      return;
    }
    const fetchDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/voters/${user.voterId}`);
        const data = await res.json();
        setDetails(data);
        setForm(data);
      } catch (err) {
        console.error("Error fetching voter details:", err);
        setStatus("Failed to load profile.");
      }
    };
    fetchDetails();
  }, [user, navigate]);

  const startEditing = () => {
    setErrors({});
    setStatus("");
    setForm(details);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setErrors({});
    setStatus("");
    setForm(details);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // live validation for some fields
    setErrors((prev) => {
      const next = { ...prev };
      if (name === "email") {
        const valid = /^\S+@\S+\.\S+$/.test(value);
        next.email = valid ? undefined : "Enter a valid email address.";
      }
      if (name === "age") {
        const num = Number(value);
        next.age = num >= 18 ? undefined : "Age must be 18 or above.";
      }
      return next;
    });
  };

  // Compute only changed fields to send
  const changedFields = useMemo(() => {
    if (!details) return {};
    const changed = {};
    for (const key of Object.keys(form || {})) {
      if (
        key !== "password" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "id"
      ) {
        if (form[key] !== details[key]) {
          changed[key] = form[key];
        }
      }
    }
    // Never allow voterId change
    if ("voterId" in changed) delete changed.voterId;
    return changed;
  }, [form, details]);

  const validateBeforeSave = () => {
    const next = {};
    if (!form.name?.trim()) next.name = "Name is required.";
    if (!form.email?.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email is required.";
    if (form.age !== undefined) {
      const num = Number(form.age);
      if (Number.isNaN(num) || num < 18) next.age = "Age must be 18 or above.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveChanges = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validateBeforeSave()) return;

    if (Object.keys(changedFields).length === 0) {
      setStatus("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/voters/${user.voterId}`, {
        method: "PUT", // If you prefer PATCH, switch here and support in backend.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      });

      if (!res.ok) {
        const errText = await res.text();
        setStatus(errText || "Update failed.");
        setSaving(false);
        return;
      }

      const updated = await res.json();
      const updatedVoter = updated.voter || updated; // support either shape

      setDetails(updatedVoter);
      setForm(updatedVoter);
      setAuth({ ...user, ...updatedVoter });
      localStorage.setItem("app_user", JSON.stringify({ ...user, ...updatedVoter }));

      setStatus("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      setStatus("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const goChangePassword = () => navigate("/change-password");

  if (!details) {
    return (
      <div className="profile-page">
        <div className="card">
          <h1 className="profile-heading">Your Profile</h1>
          <p className="status-msg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="card">
        <h1 className="profile-heading">Your Profile</h1>
        <p className="profile-id">ID: {details.voterId}</p>

        {status && <p className="status-msg">{status}</p>}

        {!editing ? (
          <>
            <div className="details">
              <p><strong>Name:</strong> {details.name}</p>
              <p><strong>Email:</strong> {details.email}</p>
              <p><strong>Address:</strong> {details.address}</p>
              <p><strong>Age:</strong> {details.age}</p>
              <p><strong>Gender:</strong> {details.gender}</p>
              <p><strong>Citizenship:</strong> {details.citizenship}</p>
              <p><strong>Residency:</strong> {details.residency}</p>
            </div>

            <div className="button-group">
              <button className="edit-btn" onClick={startEditing}>
                Edit Profile
              </button>
              <button className="password-btn" onClick={goChangePassword}>
                Update Password
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={saveChanges} noValidate>
            {visibleFields.map((field) => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  name={field}
                  value={form[field] ?? ""}
                  onChange={onChange}
                  className={`input ${errors[field] ? "input-error" : ""}`}
                  readOnly={readOnlyFields.includes(field)}
                  type={field === "age" ? "number" : "text"}
                />
                {errors[field] && <div className="error-msg">{errors[field]}</div>}
              </div>
            ))}

            <div className="edit-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="update-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="helper-row">
              <small>Note: Password, createdAt, and updatedAt are managed separately.</small>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
