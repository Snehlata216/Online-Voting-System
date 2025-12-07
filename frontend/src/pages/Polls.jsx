// src/pages/Polls.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Polls.css";

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");

  const loadPolls = async () => {
    try {
      const res = await fetch("/api/polls", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPolls(Array.isArray(data) ? data : []);
      setStatus("");
    } catch (err) {
      console.error("loadPolls error:", err);
      setStatus("Error loading polls");
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleClose = async (id, question) => {
    if (!window.confirm(`Close poll "${question}"?`)) return;
    try {
      const res = await fetch(`/api/polls/${id}/close`, { method: "PUT", cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setPolls(prev =>
        prev.map(p => ((p.pollId === id || p.id === id || p._id === id) ? { ...p, isActive: false } : p))
      );
      setToast("Poll closed");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error("handleClose error:", err);
      setStatus("Failed to close poll");
    }
  };

  const handleDelete = async (id, question) => {
    if (!window.confirm(`Delete poll "${question}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/polls/${id}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setPolls(prev => prev.filter(p => !(p.pollId === id || p.id === id || p._id === id)));
      setToast("Poll deleted");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error("handleDelete error:", err);
      setStatus("Failed to delete poll");
    }
  };

  return (
    <div className="page-container">
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <div className="page-header">
        <h2>Polls</h2>
        <Link to="/polls/new" className="btn-primary" aria-label="Create a new poll">
          Create Poll
        </Link>
      </div>

      {status && (
        <div className="status-msg error" role="alert">
          {status}
        </div>
      )}

      <div className="table-wrapper">
        <table className="table" role="table">
          <thead>
            <tr>
              <th scope="col">Question</th>
              <th scope="col">Expires</th>
              <th scope="col">Status</th>
              <th scope="col" className="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {polls.map(p => {
              const id = p.pollId ?? p.id ?? p._id;
              const expiresText = p.expiresAt ? new Date(p.expiresAt).toLocaleString() : "—";
              const statusText = p.isActive ? "Active" : "Closed";

              return (
                <tr key={id}>
                  <td>{p.question}</td>
                  <td>{expiresText}</td>
                  <td>
                    <span className={`status-pill ${p.isActive ? "active" : "inactive"}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="actions">
                    <div className="action-buttons">
                      <Link
                        to={`/polls/${id}/results`}
                        className="btn-small btn-secondary"
                        aria-label={`View results for "${p.question}"`}
                      >
                        Results
                      </Link>

                      <Link
                        to={`/polls/${id}`}
                        className="btn-small btn-edit"
                        aria-label={`Edit poll "${p.question}"`}
                      >
                        Edit
                      </Link>

                      {p.isActive && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleClose(id, p.question)}
                          aria-label={`Close poll "${p.question}"`}
                        >
                          Close
                        </button>
                      )}

                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDelete(id, p.question)}
                        aria-label={`Delete poll "${p.question}"`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {polls.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No polls available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
