// src/pages/admin/FeedbackReport.jsx
// Feedback report page for admin: fetches feedback for an election,
// shows summary cards, a feedback table, a simple rating distribution chart,
// and CSV export. Defensive and accessible.

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFeedbackReport } from "../../api/reports";

import { downloadCsv } from "../../utils/downloadCsv";
import CandidateBarChart from "../../components/charts/BarChart"; // optional reuse for distribution
import "./reports.css";

export default function FeedbackReport() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState([]); // array of feedback objects
  const [summary, setSummary] = useState(null); // optional meta from API

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        // API should return either { feedback: [...], summary: {...} } or an array
        const res = await getFeedbackReport(electionId).catch((e) => {
          console.error("getFeedbackReport error:", e);
          return null;
        });

        if (!mounted) return;

        if (!res) {
          setFeedback([]);
          setSummary(null);
        } else if (Array.isArray(res)) {
          setFeedback(res);
          setSummary(null);
        } else {
          setFeedback(Array.isArray(res.feedback) ? res.feedback : []);
          setSummary(res.summary ?? null);
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err);
        if (mounted) setError("Failed to load feedback data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [electionId]);

  // Derived metrics
  const totalFeedback = feedback.length;

  // Example: compute rating distribution if feedback items have a numeric `rating` 1-5
  const ratingDistribution = useMemo(() => {
    const dist = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    feedback.forEach((f) => {
      const r = Number(f.rating);
      if (r >= 1 && r <= 5) dist[String(r)] += 1;
    });
    return Object.entries(dist).map(([k, v]) => ({ label: `${k}★`, value: v }));
  }, [feedback]);

  // Prepare CSV rows
  const csvRows = useMemo(
    () =>
      feedback.map((f) => ({
        id: f.id ?? f.feedbackId ?? "",
        electionId: f.electionId ?? electionId ?? "",
        author: f.author ?? f.name ?? "",
        rating: f.rating ?? "",
        comment: (f.comment ?? "").replace(/\r?\n/g, " "),
        createdAt: f.createdAt ?? f.timestamp ?? "",
      })),
    [feedback, electionId]
  );

  if (loading) return <div className="muted">Loading feedback…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="reports-page">
      <header
        className="reports-header"
        style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/reports")}
            aria-label="Back to reports"
          >
            ← Back to Reports
          </button>

          <div>
            <h1>Feedback Report</h1>
            <p className="muted">Election ID: {electionId}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-secondary"
            onClick={() => downloadCsv(`election-${electionId}-feedback.csv`, csvRows)}
            aria-label="Download feedback CSV"
          >
            Download Feedback CSV
          </button>
        </div>
      </header>

      <section className="summary-cards" aria-label="Feedback summary">
        <div className="card" role="region" aria-label="Feedback summary">
          <strong>Feedback received</strong>
          <div className="small muted">{totalFeedback} item{totalFeedback !== 1 ? "s" : ""}</div>
        </div>

        <div className="card" role="region" aria-label="Feedback meta">
          <strong>Summary</strong>
          <div className="small muted">{summary?.note ?? "No summary available"}</div>
        </div>

        <div className="card" role="region" aria-label="Rating distribution">
          <strong>Rating distribution</strong>
          <div className="small muted">{ratingDistribution.reduce((s, r) => s + r.value, 0)} rated items</div>
        </div>
      </section>

      <section className="chart-section" aria-label="Feedback charts">
        <h3>Rating distribution</h3>
        <div className="table-wrap" style={{ padding: 12 }}>
          {/* Reuse BarChart to show distribution; map to expected shape */}
          <CandidateBarChart
            candidates={ratingDistribution.map((r, i) => ({
              candidateId: i + 1,
              name: r.label,
              totalVotes: r.value,
            }))}
          />
        </div>
      </section>

      <section className="table-section" aria-label="Feedback list" style={{ marginTop: 18 }}>
        <h3>Feedback items</h3>
        <div className="table-wrap">
          {feedback.length === 0 ? (
            <div className="muted">No feedback available for this election.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr key={f.id ?? f.feedbackId ?? `${f.electionId}-${Math.random()}`}>
                    <td>
                      <strong>{f.author ?? f.name ?? "Anonymous"}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>
                        ID: {f.id ?? f.feedbackId ?? "—"}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{f.rating ?? "—"}</td>
                    <td style={{ maxWidth: 640, whiteSpace: "normal" }}>{f.comment ?? f.text ?? "—"}</td>
                    <td style={{ textAlign: "right" }}>{f.createdAt ? new Date(f.createdAt).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
