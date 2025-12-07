// src/pages/VoterPolls.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Polls.css";

export default function VoterPolls() {
  const [polls, setPolls] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPolls = useCallback(async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/polls", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      // Show only open, non-expired polls for voters
      const now = new Date();
      const activePolls = list.filter((p) => {
        const expired = p.expiresAt ? new Date(p.expiresAt) < now : false;
        return p.isActive && !expired;
      });

      setPolls(activePolls);
    } catch (err) {
      console.error("loadPolls error:", err);
      setStatus("Error loading active polls");
      setPolls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const openPoll = (p) => {
    const id = p.pollId ?? p.id ?? p._id;
    if (!id) {
      setStatus("Invalid poll id");
      return;
    }
    navigate(`/voter/polls/${id}`);
  };

  return (
    <div className="voter-polls-page">
      <div className="page-header" style={{ marginBottom: 12 }}>
        <h2 className="page-title">Active Polls</h2>
        {/* Refresh removed per request */}
      </div>

      <div role="status" aria-live="polite" style={{ minHeight: 24 }}>
        {status && <div className="status-msg error">{status}</div>}
      </div>

      {loading ? (
        <div className="polls-grid" aria-hidden>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="poll-card skeleton" aria-hidden>
              <div className="skeleton-line" style={{ width: "60%" }} />
              <div className="skeleton-line" style={{ width: "40%" }} />
              <div className="skeleton-line" style={{ width: "30%" }} />
              <div className="skeleton-actions" style={{ marginTop: 12 }}>
                <div className="skeleton-pill" style={{ width: 100, height: 36, borderRadius: 8 }} />
                <div className="skeleton-pill" style={{ width: 100, height: 36, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="polls-grid">
          {polls.length === 0 ? (
            <div className="empty-state" role="status" aria-live="polite">
              No active polls right now. Please check back later.
            </div>
          ) : (
            polls.map((p) => {
              const id = p.pollId ?? p.id ?? p._id;
              const expiresText = p.expiresAt ? new Date(p.expiresAt).toLocaleString() : "—";
              return (
                <article
                  key={id || Math.random()}
                  className="poll-card"
                  aria-labelledby={`poll-${id}-title`}
                >
                  <div>
                    <div id={`poll-${id}-title`} className="poll-question">
                      {p.question}
                    </div>
                    <div className="poll-expiry" style={{ marginTop: 6 }}>
                      <strong>Expires:</strong> {expiresText}
                    </div>
                    <div
                      className={`poll-status ${p.isActive ? "open" : "closed"}`}
                      style={{ marginTop: 6 }}
                    >
                      Status: {p.isActive ? "Open" : "Closed"}
                    </div>
                  </div>

                  <div className="poll-actions" style={{ marginTop: 12 }}>
                    {/* Primary action opens the poll detail page (where voting occurs) */}
                    <button
                      className="btn-primary"
                      onClick={() => openPoll(p)}
                      aria-label={`Open poll: ${p.question}`}
                    >
                      Open poll
                    </button>

                    <Link
                      to={id ? `/voter/polls/${id}/results` : "#"}
                      className="btn-secondary"
                      aria-label={`View results for: ${p.question}`}
                      style={{ marginLeft: 8 }}
                    >
                      View Results
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
