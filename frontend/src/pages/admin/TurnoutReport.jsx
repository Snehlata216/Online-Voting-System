// src/pages/admin/TurnoutReport.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVoterTurnout } from "../../api/reports";
import "./reports.css";

export default function TurnoutReport() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await getVoterTurnout(electionId);
        if (!mounted) return;
        const normalized = Array.isArray(res) ? res : res ? [res] : [];
        setData(normalized);
      } catch (err) {
        console.error("Turnout fetch error:", err);
        if (mounted) setError("Failed to load turnout data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [electionId]);

  if (loading) return <div className="muted">Loading turnout…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="reports-page turnout-page">
      <header className="reports-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-secondary" onClick={() => navigate("/admin/reports")}>← Back to Reports</button>
          <div>
            <h1>Turnout Report</h1>
            <p className="muted">Election ID: {electionId ?? "N/A"}</p>
          </div>
        </div>
      </header>

      <section className="table-section">
        <h3>Turnout</h3>
        <div className="table-wrap">
          {(!data || data.length === 0) ? (
            <>
              <div className="muted">No turnout data available.</div>
              <pre style={{ marginTop: 12, fontSize: 13 }}>
                {/* helpful debug info */}
                {JSON.stringify({ apiPath: `/api/reports/voter-turnout/${electionId}`, sampleResponse: data }, null, 2)}
              </pre>
            </>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Constituency</th>
                  <th>Registered</th>
                  <th>Votes</th>
                  <th>Turnout</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i}>
                    <td>{r.constituency ?? r.region ?? `Region ${i + 1}`}</td>
                    <td>{r.totalVoters ?? r.registered ?? "—"}</td>
                    <td>{r.totalVotes ?? r.votes ?? 0}</td>
                    <td>{r.turnoutPercentage ?? ((r.totalVotes && r.totalVoters) ? `${((r.totalVotes/r.totalVoters)*100).toFixed(1)}%` : "—")}</td>
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
