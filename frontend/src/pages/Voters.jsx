// Admin page to list/manage voters
// Shows all voters (GET /voters) and delete action (DELETE /voters/:id)

import React, { useEffect, useState } from "react";
import { listVoters, deleteVoter } from "../api/voters";
import { Link } from "react-router-dom";
import "./Voters.css";

export default function Voters() {
  const [voters, setVoters] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => { load(); }, []);

  // Load voters from backend
  const load = async () => {
    setStatus("Loading voters...");
    try {
      const res = await listVoters();
      setVoters(res.data || []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load voters");
    }
  };

  const handleDelete = async (voterId) => {
    if (!confirm("Delete this voter?")) return;
    try {
      await deleteVoter(voterId);
      setVoters((s) => s.filter((v) => v.voterId !== voterId));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Voters</h1>
        <Link className="button" to="/voters/new">New Voter</Link>
      </div>

      {status && <p>{status}</p>}

      <div className="card-grid">
        {voters.map((v) => (
          <div className="voter-card" key={v.voterId}>
            <h3 className="voter-name">{v.name}</h3>
            <p className="voter-meta"><strong>Voter ID:</strong> {v.voterId}</p>
            <p className="voter-meta"><strong>Email:</strong> {v.email}</p>
            <p className="voter-meta"><strong>Age:</strong> {v.age}</p>
            <p className="voter-meta"><strong>Gender:</strong> {v.gender}</p>
            <p className="voter-meta"><strong>Eligibility:</strong> {String(v.eligibilityStatus)}</p>

            <div className="voter-card-actions">
              <Link className="button" to={`/voters/${v.voterId}/edit`}>Edit</Link>
              <button className="button danger" onClick={() => handleDelete(v.voterId)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
