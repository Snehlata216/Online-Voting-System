// src/pages/Vote.jsx
import React, { useEffect, useState, useContext } from "react";
import { listCandidates, castElectionVote, listVoters } from "../api/votes"; // ✅ updated import
import "./Vote.css";
import { AuthContext } from "../context/AuthContext";

export default function Vote() {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [selectedVoter, setSelectedVoter] = useState(
    user?.role === "voter" ? user.voterId || "" : ""
  );
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadCandidates();
    if (user?.role === "admin") loadVoters();
  }, [user]);

  const loadCandidates = async () => {
    try {
      const res = await listCandidates();
      setCandidates(res.data || []);
    } catch (err) {
      console.error("Candidates load error", err);
      setStatus("Failed to load candidates");
    }
  };

  const loadVoters = async () => {
    try {
      const res = await listVoters();
      setVoters(res.data || []);
    } catch (err) {
      console.error("Voters load error", err);
      setStatus("Failed to load voters");
    }
  };

  const onVote = async (candidate) => {
    const candidateId = Number(candidate.candidateId);
    const electionId = Number(candidate.electionId);
    const voterId = user?.role === "voter" ? user.voterId : selectedVoter;

    if (!voterId || !candidateId || !electionId) {
      alert("Missing voterId, candidateId, or electionId in payload");
      return;
    }

    const payload = { voterId, candidateId, electionId };

    setStatus("Casting election vote...");
    try {
      await castElectionVote(payload); // ✅ updated call
      setStatus("✅ Your vote has been recorded successfully!");
    } catch (err) {
      console.error("Election vote error", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data;
      setStatus(serverMsg || "Vote failed");
    }
  };

  return (
    <div className="page vote-page">
      <h1>Cast Election Vote</h1>

      {user?.role === "admin" && (
        <div className="vote-select">
          <label>Select Voter</label>
          <select
            className="input"
            value={selectedVoter}
            onChange={(e) => setSelectedVoter(e.target.value)}
          >
            <option value="">-- choose voter --</option>
            {voters.map((v) => (
              <option key={v.voterId} value={v.voterId}>
                {v.name} ({v.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {user?.role === "voter" && (
        <p style={{ marginBottom: 12 }}>
          Logged in as: <strong>{user.name}</strong> (Voter ID: {user.voterId})
        </p>
      )}

      {status && <p className="status-msg">{status}</p>}

      <div className="card-grid">
        {candidates.map((c) => (
          <div className="card" key={c.candidateId}>
            <h3>{c.name}</h3>
            <p>Candidate ID: {c.candidateId}</p>
            <p>Party ID: {c.partyId}</p>
            <p>Election ID: {c.electionId}</p>
            <button className="button" onClick={() => onVote(c)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  );
}
