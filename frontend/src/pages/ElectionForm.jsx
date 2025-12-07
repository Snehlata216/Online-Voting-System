// src/pages/ElectionForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createElection, getElection, updateElection } from "../api/elections";
import "./ElectionForm.css";

export default function ElectionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    electionType: "",
    adminId: "",
    status: ""
  });
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => { if (isEdit) load(); }, [id]);

  const load = async () => {
    setStatusMsg("Loading...");
    try {
      const res = await getElection(id);
      const d = res.data || {};
      setForm({
        title: d.title || "",
        description: d.description || "",
        startDate: d.startDate || "",
        endDate: d.endDate || "",
        electionType: d.electionType || "",
        adminId: d.adminId || "",
        status: d.status || ""
      });
      setStatusMsg("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Unable to load election");
    }
  };

  const onChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("Saving...");
    try {
      if (isEdit) await updateElection(id, form);
      else await createElection(form);
      navigate("/elections");
    } catch (err) {
      console.error(err);
      setStatusMsg(err.response?.data?.message || "Save failed");
    }
  };

  return (
    <div className="page">
      <h1>{isEdit ? "Edit Election" : "New Election"}</h1>
      <form className="election-form" onSubmit={onSubmit}>
        <input className="input" name="title" value={form.title} onChange={onChange} placeholder="Title" required />
        <textarea className="input" name="description" value={form.description} onChange={onChange} placeholder="Description" required />
        <input className="input" type="date" name="startDate" value={form.startDate} onChange={onChange} required />
        <input className="input" type="date" name="endDate" value={form.endDate} onChange={onChange} required />
        <input className="input" name="electionType" value={form.electionType} onChange={onChange} placeholder="Election Type" required />
        <input className="input" name="adminId" value={form.adminId} onChange={onChange} placeholder="Admin ID" required />
        <select className="input" name="status" value={form.status} onChange={onChange} required>
          <option value="">Select Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <div className="form-actions">
          <button className="button" type="submit">{isEdit ? "Update" : "Create"}</button>
          <button className="button ghost" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
        {statusMsg && <p style={{ marginTop: 10 }}>{statusMsg}</p>}
      </form>
    </div>
  );
}
