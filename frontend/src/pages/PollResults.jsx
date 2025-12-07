// src/pages/PollResults.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Polls.css";

export default function PollResults() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch(`/api/polls/${id}/results`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setStatus("Error loading results");
      } finally {
        setLoading(false);
      }
    };
    load();
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
          <div className="status-msg error" role="alert">{status || "No results available."}</div>
          <Link to="/polls" className="btn-secondary">Back to polls</Link>
        </div>
      </div>
    );
  }

  const totalVotes = results.totalVotes || 0;
  const isExpired = results.expiresAt && new Date(results.expiresAt) < new Date();
  const isClosed = results.isActive === false;

  return (
    <div className="form-page">
      <div className="form-card">
        {(isClosed || isExpired) && (
          <div className="banner warning">
            {isClosed ? "This poll is closed." : "This poll has expired."}
          </div>
        )}

        <div className="form-header" style={{ marginBottom: 6 }}>
          <h2>Results</h2>
          <Link to="/polls" className="link-back">Back to polls</Link>
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

        <ul className="results-list" style={{ display: "grid", gap: 8 }}>
          {results.options.map((opt, idx) => {
            const pct = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(2) : "0.00";
            return (
              <li key={idx} className="result-item" style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <span style={{ color: "#cfe8ff", fontWeight: 700 }}>{opt.text}</span>
                  <span style={{ color: "#a7f3d0", fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ marginTop: 6, color: "#94a3b8" }}>{opt.votes} votes</div>
                <div style={{ marginTop: 8, height: 8, background: "#1e293b", borderRadius: 999 }}>
                  <div
                    style={{
                      width: `${totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0}%`,
                      height: "100%",
                      background: "#10b981",
                      borderRadius: 999,
                      transition: "width .25s ease"
                    }}
                    aria-hidden
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Link to="/polls" className="btn-secondary">Back to polls</Link>
        </div>
      </div>
    </div>
  );
}
