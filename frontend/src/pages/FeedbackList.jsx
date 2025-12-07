// src/pages/FeedbackList.jsx
import React, { useEffect, useState } from "react";
import { listFeedbacks, deleteFeedback } from "../api/feedbacks";
import "./FeedbackList.css";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await listFeedbacks();
      // backend returns array in res.data
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
      setStatus("Failed to load feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (rawId) => {
    if (!window.confirm("Delete this feedback?")) return;

    const id = Number(rawId);
    if (Number.isNaN(id)) {
      setStatus("Invalid feedback id.");
      return;
    }

    setDeletingId(id);
    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.feedbackId !== id));
      setStatus("Feedback deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      setStatus("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="feedback-list-page">
      <h1>Feedbacks</h1>

      {status && <p className="feedback-status">{status}</p>}

      {loading ? (
        <p className="feedback-status">Loading...</p>
      ) : feedbacks.length === 0 ? (
        <p className="feedback-status">No feedbacks yet.</p>
      ) : (
        <table className="feedback-table" role="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Voter ID</th>
              <th>Comments</th>
              <th>Rating</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb) => (
              <tr key={fb.feedbackId}>
                <td>{fb.feedbackId}</td>
                <td>{fb.voterId ?? "—"}</td>
                <td className="comments-cell">{fb.comments}</td>
                <td>{fb.rating}</td>
                <td>{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : "—"}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(fb.feedbackId)}
                    disabled={deletingId === fb.feedbackId}
                  >
                    {deletingId === fb.feedbackId ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
