// src/pages/VoterPollResults.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Polls.css";

export default function VoterPollResults() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch(`/api/polls/${id}/results`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!mounted) return;
        setResults(data);
      } catch (err) {
        console.error("load results error:", err);
        if (!mounted) return;
        setStatus("Error loading results");
        setResults(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="skeleton-line" style={{ width: "50%" }} />
          <div className="skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton-line" style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="status-msg error" role="alert">
            {status || "No results available."}
          </div>
          <div style={{ marginTop: 12 }}>
            <Link to="/voter/polls" className="btn-secondary">Back to Active Polls</Link>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = results.totalVotes || results.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0;
  const isExpired = results.expiresAt && new Date(results.expiresAt) < new Date();
  const isClosed = results.isActive === false;

  return (
    <div className="form-page">
      <div className="form-card">
        {(isClosed || isExpired) && (
          <div className="banner warning" role="status">
            {isClosed ? "This poll is closed." : "This poll has expired."}
          </div>
        )}

        <div className="form-header" style={{ marginBottom: 8 }}>
          <h2>Results</h2>
          <Link to="/voter/polls" className="link-back">Back to Active Polls</Link>
        </div>

        <p className="poll-expiry" style={{ marginBottom: 10 }}>
          <strong>Question:</strong> {results.question}
        </p>

        <div className="results-summary" style={{ marginBottom: 12, color: "#cbd5e1" }}>
          <span><strong>Total votes:</strong> {totalVotes}</span>
          {results.expiresAt && (
            <span style={{ marginLeft: 12 }}>
              <strong>Expires:</strong> {new Date(results.expiresAt).toLocaleString()}
            </span>
          )}
          <span style={{ marginLeft: 12 }}>
            <strong>Status:</strong> {isClosed ? "Closed" : isExpired ? "Expired" : "Open"}
          </span>
        </div>

        <ul className="results-list" style={{ display: "grid", gap: 10 }}>
          {Array.isArray(results.options) && results.options.map((opt, idx) => {
            const votes = Number(opt.votes || 0);
            const pct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : "0.00";
            return (
              <li key={idx} className="result-item">
                <div className="result-row">
                  <div className="result-title">{opt.text}</div>
                  <div className="result-pct">{pct}%</div>
                </div>

                <div className="result-sub" style={{ marginTop: 6 }}>
                  <span className="muted">{votes} votes</span>
                </div>

                <div className="result-bar" aria-hidden>
                  <div
                    className="result-bar-fill"
                    style={{ width: `${totalVotes > 0 ? (votes / totalVotes) * 100 : 0}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link to={`/voter/polls/${id}`} className="btn-primary">Back to poll</Link>
          <Link to="/voter/polls" className="btn-secondary">Back to Active Polls</Link>
        </div>
      </div>
    </div>
  );
}
