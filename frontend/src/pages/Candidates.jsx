// Admin list/manage candidates page
// Shows fields matching your schema: candidateId, name, electionId, partyId, manifesto, totalVotes

import React, { useEffect, useState } from "react";
import { listCandidates, deleteCandidate } from "../api/candidates";
import { Link } from "react-router-dom";
import "./Candidates.css";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => { load(); }, []);

  // Load candidates from backend
  const load = async () => {
    setStatus("Loading candidates...");
    try {
      const res = await listCandidates();
      setCandidates(res.data || []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to load candidates");
    }
  };

  // Delete by candidateId
  const handleDelete = async (candidateId) => {
    if (!confirm("Delete this candidate?")) return;
    try {
      await deleteCandidate(candidateId);
      setCandidates((s) => s.filter((c) => c.candidateId !== candidateId));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Candidates</h1>
        <Link className="button" to="/candidates/new">New Candidate</Link>
      </div>

      {status && <p>{status}</p>}

      <div className="card-grid">
        {candidates.map((c) => (
          <div className="candidate-card" key={c.candidateId}>
            <h3 className="candidate-name">{c.name}</h3>
            <p className="candidate-meta"><strong>Candidate ID:</strong> {c.candidateId}</p>
            <p className="candidate-meta"><strong>Election ID:</strong> {c.electionId}</p>
            <p className="candidate-meta"><strong>Party ID:</strong> {c.partyId}</p>
            {c.manifesto && <p className="candidate-meta"><strong>Manifesto:</strong> {c.manifesto}</p>}
            <p className="candidate-meta"><strong>Total Votes:</strong> {c.totalVotes}</p>
            <div className="candidate-actions">
              <Link className="candidate-button candidate-edit" to={`/candidates/${c.candidateId}/edit`}>Edit</Link>
              <button className="candidate-button candidate-delete" onClick={() => handleDelete(c.candidateId)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
