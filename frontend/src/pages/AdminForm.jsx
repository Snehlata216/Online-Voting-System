// src/pages/AdminForm.jsx
// Form for creating a new admin. Backend only supports register, not update.
// So this page is simplified to "New Admin" only.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin } from "../api/admins";
import "./AdminForm.css";

export default function AdminForm() {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");

  // Handle input changes
  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  // Submit handler
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setStatus("All fields are required");
      return;
    }

    try {
      await registerAdmin(form);
      // Navigate back to admins list after success
      navigate("/admins");
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="page">
      <h1>New Admin</h1>
      <form className="admin-form" onSubmit={onSubmit}>
        <input
          className="input"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Name"
          required
        />
        <input
          className="input"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          required
        />
        <input
          className="input"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Password"
          required
        />
        <div className="form-actions">
          <button className="button" type="submit">
            Create
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </form>
    </div>
  );
}
