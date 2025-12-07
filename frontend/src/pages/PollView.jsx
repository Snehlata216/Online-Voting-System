// src/pages/PollView.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Polls.css";

export default function VoterPollView() {
  const { id } = useParams();
  const { user } = useContext(AuthContext); // should contain voterId
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoll = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/polls/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPoll(data);
      } catch (err) {
        setStatus("❌ Poll not found or error loading poll");
      } finally {
        setLoading(false);
      }
    };
    loadPoll();
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption) {
      setStatus("⚠️ Please select an option before voting.");
      return;
    }
    if (!user?.voterId) {
      setStatus("❌ Missing voter identity. Please re-login.");
      return;
    }
    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: user.voterId,
          option: selectedOption,
        }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setStatus("✅ " + result.message);
      setSelectedOption("");

      // Refresh poll data
      const updatedPoll = await fetch(`/api/polls/${id}`, { cache: "no-store" }).then((r) => r.json());
      setPoll(updatedPoll);
    } catch (err) {
      setStatus("❌ Error submitting vote: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="skeleton-line" style={{ width: "55%" }} />
          <div className="skeleton-line" style={{ width: "35%" }} />
          <div className="skeleton-line" style={{ width: "45%" }} />
          <div className="skeleton-line" style={{ width: "25%" }} />
        </div>
      </div>
    );
  }

  if (!poll) return <div className="loader">{status}</div>;

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const isClosed = !poll.isActive;
  const isVotingDisabled = isClosed || isExpired;

  return (
    <div className="form-page">
      <div className="form-card">
        {(isClosed || isExpired) && (
          <div className="banner warning">
            {isClosed ? "This poll is closed." : "This poll has expired."}
          </div>
        )}

        <div className="form-header" style={{ marginBottom: 8 }}>
          <h2>{poll.question}</h2>
          <Link to="/voter/polls" className="link-back">Back to Active Polls</Link>
        </div>

        <p className="poll-expiry">
          <strong>Expires:</strong>{" "}
          {poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : "—"}
        </p>
        <p className={`poll-status ${isVotingDisabled ? "closed" : "open"}`}>
          Status: {isClosed ? "Closed" : isExpired ? "Expired" : "Open"}
        </p>

        <div className="options-list" role="radiogroup" aria-label="Poll options">
          {poll.options?.map((opt, idx) => (
            <label key={idx} className="option-item">
              <input
                type="radio"
                name="voteOption"
                value={opt.text}
                disabled={isVotingDisabled}
                checked={selectedOption === opt.text}
                onChange={() => setSelectedOption(opt.text)}
              />
              {opt.text} <span className="muted">({opt.votes} votes)</span>
            </label>
          ))}
        </div>

        <div className="muted" style={{ marginTop: 4, marginBottom: 10 }}>
          Your selection is anonymous. One vote per poll.
        </div>

        {status && (
          <div className="status-msg" role="status" aria-live="polite">
            {status}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!isVotingDisabled && (
            <button className="btn-primary" onClick={handleVote}>
              Cast Vote
            </button>
          )}
          <Link to={`/voter/polls/${id}/results`} className="btn-secondary">
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}
