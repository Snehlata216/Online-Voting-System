// src/pages/Elections.jsx
import React, { useEffect, useState } from "react";
import { listElections, deleteElection } from "../api/elections";
import { Link } from "react-router-dom";
import "./Elections.css";

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setStatus("Loading elections...");
    try {
      const res = await listElections();
      setElections(res.data || []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load elections");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this election?")) return;
    try {
      await deleteElection(id);
      setElections(s => s.filter(e => e.electionId !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Elections</h1>
        <Link className="button" to="/elections/new">New Election</Link>
      </div>
      {status && <p>{status}</p>}
      <div className="card-grid">
        {elections.map(e => (
          <div className="election-card" key={e.electionId}>
            <h3 className="election-name">{e.title}</h3>
            <p className="election-meta"><strong>Description:</strong> {e.description}</p>
            <p className="election-meta"><strong>Type:</strong> {e.electionType}</p>
            <p className="election-meta"><strong>Start:</strong> {e.startDate}</p>
            <p className="election-meta"><strong>End:</strong> {e.endDate}</p>
            <p className="election-meta"><strong>Status:</strong> {e.status}</p>
            <p className="election-meta"><strong>Admin ID:</strong> {e.adminId}</p>
            <p className="election-meta"><strong>Created:</strong> {e.createdAt}</p>
            <p className="election-meta"><strong>Updated:</strong> {e.updatedAt}</p>
            <div className="election-actions">
              <Link className="button edit" to={`/elections/${e.electionId}/edit`}>Edit</Link>
              <button className="button danger" onClick={() => handleDelete(e.electionId)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
