// src/pages/VoterRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVoter } from "../api/voters"; // uses POST /voters by default
import "./VoterRegister.css";

export default function VoterRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    voterId: "",
    name: "",
    address: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    citizenship: "",
    residency: "",
  });
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("Registering...");
    try {
      // Update api/voters if your backend uses /voters/register
      await createVoter(form);
      setStatus("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1100);
    } catch (err) {
      console.error("Register error", err);
      const msg = err?.response?.data?.message || err?.message || "Registration failed";
      setStatus(msg);
    }
  };

  return (
    <div className="page">
      <h1>Voter Registration</h1>
      <form className="voter-form" onSubmit={onSubmit}>
        <input
          className="input"
          name="voterId"
          value={form.voterId}
          onChange={onChange}
          placeholder="Voter ID (optional, auto-generated allowed)"
        />
        <input
          className="input"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Full name"
          required
        />
        <input
          className="input"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          required
        />

        {/* Password with eye toggle */}
        <div
          className="input"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            paddingRight: 44,
          }}
        >
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            required
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "inherit",
            }}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "1px solid #243042",
              borderRadius: 6,
              padding: "6px 8px",
              cursor: "pointer",
              color: "#cbd5e1",
            }}
          >
            {showPassword ? (
              // Eye-off icon (simple)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 3l18 18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 001.42-.38" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 12s4-7 10-7 10 7 10 7c-.72 1.27-1.64 2.44-2.73 3.46" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                <path d="M6.12 6.12A17.66 17.66 0 002 12c0 0 4 7 10 7 2.34 0 4.45-.72 6.28-1.86" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              // Eye icon (simple)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="12" cy="12" r="3" stroke="#cbd5e1" strokeWidth="2" />
              </svg>
            )}
          </button>
        </div>

        <input className="input" name="age" value={form.age} onChange={onChange} placeholder="Age" />
        <input className="input" name="gender" value={form.gender} onChange={onChange} placeholder="Gender" />
        <input className="input" name="citizenship" value={form.citizenship} onChange={onChange} placeholder="Citizenship" />
        <input className="input" name="residency" value={form.residency} onChange={onChange} placeholder="Residency" />
        <textarea className="input" name="address" value={form.address} onChange={onChange} placeholder="Address" rows={3} />

        <div style={{ display: "flex", gap: 10 }}>
          <button className="button" type="submit">Register</button>
          <button className="button candidate-cancel" type="button" onClick={() => navigate("/")}>Cancel</button>
        </div>

        {status && <p style={{ marginTop: 12 }}>{status}</p>}
      </form>
    </div>
  );
}
