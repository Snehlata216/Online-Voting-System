// Create / Edit voter form used by admin.
// Uses createVoter and updateVoter endpoints.

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createVoter, getVoter, updateVoter } from "../api/voters";
import "./VoterForm.css";

export default function VoterForm() {
  const { id } = useParams(); // expects voterId as route param
  const isEdit = Boolean(id);
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
    eligibilityStatus: false,
  });

  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isEdit) load();
  }, [id]);

  // Load voter data for editing
  const load = async () => {
    setStatus("Loading...");
    try {
      const res = await getVoter(id);
      const d = res.data || {};
      setForm({
        voterId: d.voterId || "",
        name: d.name || "",
        address: d.address || "",
        email: d.email || "",
        password: "",
        age: d.age || "",
        gender: d.gender || "",
        citizenship: d.citizenship || "",
        residency: d.residency || "",
        eligibilityStatus: Boolean(d.eligibilityStatus),
      });
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Unable to load voter");
    }
  };

  // Handle input changes (supports checkbox)
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  // Submit create/update
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      if (isEdit) await updateVoter(id, form);
      else await createVoter(form);
      navigate("/voters");
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="page">
      <h1>{isEdit ? "Edit Voter" : "New Voter"}</h1>
      <form className="voter-form" onSubmit={onSubmit}>
        <input className="input" name="voterId" placeholder="Voter ID" value={form.voterId} onChange={onChange} required />
        <input className="input" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input className="input" name="address" placeholder="Address" value={form.address} onChange={onChange} />
        <input className="input" type="email" name="email" placeholder="Email" value={form.email} onChange={onChange} required />
        {!isEdit && <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} required />}
        <input className="input" name="age" placeholder="Age" value={form.age} onChange={onChange} />
        <input className="input" name="gender" placeholder="Gender" value={form.gender} onChange={onChange} />
        <input className="input" name="citizenship" placeholder="Citizenship" value={form.citizenship} onChange={onChange} />
        <input className="input" name="residency" placeholder="Residency" value={form.residency} onChange={onChange} />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="eligibilityStatus" checked={form.eligibilityStatus} onChange={onChange} />
          Eligible to vote
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="button" type="submit">{isEdit ? "Update" : "Create"}</button>
          <button className="button candidate-cancel" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </form>
    </div>
  );
}
