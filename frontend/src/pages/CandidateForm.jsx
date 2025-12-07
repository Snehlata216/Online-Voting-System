// src/pages/CandidateForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createCandidate, getCandidate, updateCandidate } from "../api/candidates";
import "./CandidateForm.css";

export default function CandidateForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    electionId: "",
    partyId: "",
    manifesto: ""
  });

  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isEdit) loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    setStatus("Loading...");
    try {
      const res = await getCandidate(id);
      const d = res.data || {};
      setForm({
        name: d.name || "",
        electionId: d.electionId || "",
        partyId: d.partyId || "",
        manifesto: d.manifesto || ""
      });
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Unable to load candidate");
    }
  };

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      if (isEdit) await updateCandidate(id, form);
      else await createCandidate(form);
      navigate("/candidates");
    } catch (err) {
      console.error(err);
      setStatus(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="candidate-page">
      <h1 className="candidate-heading">{isEdit ? "Edit Candidate" : "New Candidate"}</h1>
      <form className="candidate-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label>Name</label>
          <input className="form-input" name="name" value={form.name} onChange={onChange} required />
        </div>
        <div className="form-row">
          <label>Election ID</label>
          <input className="form-input" name="electionId" value={form.electionId} onChange={onChange} required />
        </div>
        <div className="form-row">
          <label>Party ID</label>
          <input className="form-input" name="partyId" value={form.partyId} onChange={onChange} required />
        </div>
        <div className="form-row">
          <label>Manifesto</label>
          <textarea className="form-input" name="manifesto" value={form.manifesto} onChange={onChange} rows={3} />
        </div>
        <div className="form-actions">
          <button className="btn-primary" type="submit">{isEdit ? "Update" : "Create"}</button>
          <button className="btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
        {status && <p className="form-status">{status}</p>}
      </form>
    </div>
  );
}
