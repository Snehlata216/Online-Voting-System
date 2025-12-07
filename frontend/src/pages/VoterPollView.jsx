// src/pages/VoterPollView.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "./Polls.css";

export default function VoterPollView() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadPoll = async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch(`/api/polls/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!mounted) return;
        setPoll(data);
      } catch (err) {
        if (!mounted) return;
        console.error("load poll error:", err);
        setStatus("Poll not found or error loading poll");
        setPoll(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPoll();
    return () => { mounted = false; };
  }, [id]);

  const handleVote = async () => {
    if (!selectedOption) {
      setStatus("Please select an option before voting.");
      return;
    }
    if (!user?.voterId) {
      setStatus("Missing voter identity. Please re-login.");
      return;
    }

    setSubmitting(true);
    setStatus("Submitting vote...");
    try {
      const res = await fetch(`/api/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: user.voterId, option: selectedOption }),
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Vote failed");
      }
      const result = await res.json();
      setStatus(result?.message ? `Success: ${result.message}` : "Vote recorded");
      setSelectedOption("");
      // refresh poll
      const updated = await fetch(`/api/polls/${id}`, { cache: "no-store" }).then(r => r.json());
      setPoll(updated);
    } catch (err) {
      console.error("vote error:", err);
      setStatus(err.message || "Error submitting vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="skeleton-line" style={{ width: "60%" }} />
          <div className="skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton-line" style={{ width: "50%" }} />
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="status-msg error" role="alert">{status || "Poll not available."}</div>
          <div style={{ marginTop: 12 }}>
            <Link to="/voter/polls" className="btn-secondary">Back to Active Polls</Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const isClosed = !poll.isActive;
  const isVotingDisabled = isClosed || isExpired;

  return (
    <div className="form-page">
      <div className="form-card">
        {(isClosed || isExpired) && (
          <div className="banner warning" role="status">
            {isClosed ? "This poll is closed." : "This poll has expired."}
          </div>
        )}

        <div className="form-header" style={{ marginBottom: 8 }}>
          <h2>{poll.question}</h2>
          <Link to="/voter/polls" className="link-back">Back to Active Polls</Link>
        </div>

        <div className="meta-row" aria-hidden>
          <div className="poll-expiry"><strong>Expires:</strong> {poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : "—"}</div>
          <div className={`poll-status ${isVotingDisabled ? "closed" : "open"}`}>
            Status: {isClosed ? "Closed" : isExpired ? "Expired" : "Open"}
          </div>
        </div>

        <form className="options-list" onSubmit={(e) => { e.preventDefault(); handleVote(); }} role="radiogroup" aria-label="Poll options">
          {Array.isArray(poll.options) && poll.options.length > 0 ? (
            poll.options.map((opt, idx) => (
              <label key={idx} className="option-item" aria-checked={selectedOption === opt.text} role="radio">
                <input
                  type="radio"
                  name="voteOption"
                  value={opt.text}
                  disabled={isVotingDisabled || submitting}
                  checked={selectedOption === opt.text}
                  onChange={() => setSelectedOption(opt.text)}
                />
                <span className="option-text">{opt.text}</span>
                <span className="option-meta muted">{`(${opt.votes ?? 0} votes)`}</span>
              </label>
            ))
          ) : (
            <div className="empty-state">No options available for this poll.</div>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!isVotingDisabled && (
              <button
                type="submit"
                className="btn-primary"
                onClick={handleVote}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Submitting..." : "Cast Vote"}
              </button>
            )}

            <Link to={`/voter/polls/${id}/results`} className="btn-secondary" aria-label="View poll results">
              View Results
            </Link>
          </div>
        </form>

        {status && <div className="status-msg" role="status" aria-live="polite" style={{ marginTop: 12 }}>{status}</div>}

        <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Your selection is anonymous. One vote per poll.
        </div>
      </div>
    </div>
  );
}
