// src/pages/FeedbackForm.jsx
import React, { useContext, useEffect, useState } from "react";
import { createFeedback } from "../api/feedbacks";
import { AuthContext } from "../context/AuthContext";
import "./FeedbackForm.css";

export default function FeedbackForm({ candidateId: initialCandidateId = null }) {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState("");
  const [candidateId, setCandidateId] = useState(initialCandidateId ?? "");
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCandidateId) return;
    let mounted = true;
    async function loadCandidates() {
      try {
        const res = await fetch("/api/candidates");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load candidates", err);
      }
    }
    loadCandidates();
    return () => {
      mounted = false;
    };
  }, [initialCandidateId]);

  const validate = () => {
    const next = {};
    if (!comments.trim()) next.comments = "Please enter your feedback.";
    const r = Number(rating);
    if (rating === "" || rating === null) next.rating = "Please select a rating.";
    else if (Number.isNaN(r) || r < 1 || r > 5) next.rating = "Rating must be 1–5.";
    if (!initialCandidateId && !candidateId) next.candidateId = "Please select a candidate.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!validate()) return;

    // Resolve candidateId to a numeric value or null
    const resolvedCandidateId = initialCandidateId
      ? Number(initialCandidateId)
      : candidateId
      ? Number(candidateId)
      : null;

    const payload = {
      voterId: user?.voterId ?? null,
      comments: comments.trim(),
      rating: Number(rating),
      candidateId: Number.isNaN(resolvedCandidateId) ? null : resolvedCandidateId,
    };

    setLoading(true);
    try {
      await createFeedback(payload);
      setStatus("✅ Feedback submitted successfully.");
      setComments("");
      setRating("");
      if (!initialCandidateId) setCandidateId("");
      setErrors({});
    } catch (err) {
      console.error("Error creating feedback:", err);
      const statusCode = err?.response?.status;
      const serverData = err?.response?.data;
      const serverMsg = serverData?.message || (serverData ? JSON.stringify(serverData) : null);
      const clientMsg = serverMsg || err?.message || "Submission failed";
      setStatus(`❌ Error creating feedback${statusCode ? ` (${statusCode})` : ""}: ${clientMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page">
      <h1 className="feedback-title">Submit Feedback</h1>

      <form className="feedback-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="comments">Feedback</label>
        <textarea
          id="comments"
          className={`feedback-input ${errors.comments ? "input-error" : ""}`}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={5}
          placeholder="Write your feedback..."
          required
          aria-invalid={!!errors.comments}
          aria-describedby={errors.comments ? "err-comments" : undefined}
        />
        {errors.comments && (
          <div id="err-comments" className="error-msg" role="alert">
            {errors.comments}
          </div>
        )}

        <label htmlFor="rating">Rating</label>
        <select
          id="rating"
          className={`feedback-input ${errors.rating ? "input-error" : ""}`}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
          aria-invalid={!!errors.rating}
          aria-describedby={errors.rating ? "err-rating" : undefined}
        >
          <option value="">Select rating</option>
          <option value="1">1 — Very poor</option>
          <option value="2">2 — Poor</option>
          <option value="3">3 — Okay</option>
          <option value="4">4 — Good</option>
          <option value="5">5 — Excellent</option>
        </select>
        {errors.rating && (
          <div id="err-rating" className="error-msg" role="alert">
            {errors.rating}
          </div>
        )}

        {!initialCandidateId && (
          <>
            <label htmlFor="candidate">Candidate</label>
            <select
              id="candidate"
              className={`feedback-input ${errors.candidateId ? "input-error" : ""}`}
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              required
              aria-invalid={!!errors.candidateId}
              aria-describedby={errors.candidateId ? "err-candidate" : undefined}
            >
              <option value="">Select candidate</option>
              {candidates.map((c) => {
                // Use numeric id property if available; fall back to c.id or c.candidateId
                const id = c.id ?? c.candidateId ?? c.candidateId;
                const label = c.name ?? c.fullName ?? String(id);
                return (
                  <option key={id} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
            {errors.candidateId && (
              <div id="err-candidate" className="error-msg" role="alert">
                {errors.candidateId}
              </div>
            )}
          </>
        )}

        <div className="form-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </div>

        {status && (
          <p className={`feedback-status ${status.startsWith("✅") ? "success" : "error"}`} role="status">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}
