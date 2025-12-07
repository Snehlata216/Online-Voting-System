import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listElections } from "../../api/elections";
import { normalizeArrayResponse } from "../../utils/apiUtils";
import "./reports.css";

export default function ReportsHome() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [selectedElection, setSelectedElection] = useState("");
  const navigate = useNavigate();

  const loadElections = useCallback(async () => {
    setLoading(true);
    setLoadingError("");
    try {
      const res = await listElections();
      const items = normalizeArrayResponse(res);
      setElections(items);
      if (!selectedElection && items.length) {
        const firstId = items[0].electionId ?? items[0].id ?? "";
        setSelectedElection(firstId);
      }
    } catch (err) {
      console.error("Failed to load elections list", err);
      setElections([]);
      setLoadingError("Failed to load elections. Check network or server.");
    } finally {
      setLoading(false);
    }
  }, [selectedElection]);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  const onOpenElection = () => {
    if (!selectedElection) {
      alert("Please select an election first");
      return;
    }
    navigate(`/admin/reports/election/${selectedElection}`);
  };

  const onOpenTurnout = () => {
    if (!selectedElection) {
      navigate("/admin/reports/turnout");
      return;
    }
    navigate(`/admin/reports/turnout/${selectedElection}`);
  };

  const onOpenFeedback = () => {
    if (!selectedElection) {
      navigate("/admin/reports/feedback");
      return;
    }
    navigate(`/admin/reports/feedback/${selectedElection}`);
  };

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Reports</h1>
        <p className="muted">
          Generate and export election reports: turnout, results, polls, feedback, analytics, and security logs.
        </p>
      </header>

      <section className="reports-controls">
        <div className="control-row">
          <label htmlFor="election-select">Select election</label>

          <select
            id="election-select"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
            disabled={loading}
          >
            <option value="">-- choose an election --</option>
            {elections.map((el) => {
              const key = el.electionId ?? el.id ?? JSON.stringify(el);
              const label = el.name ?? el.title ?? `Election ${el.electionId ?? el.id ?? key}`;
              const value = el.electionId ?? el.id ?? key;
              return (
                <option key={key} value={value}>
                  {label}
                </option>
              );
            })}
          </select>

          <div className="controls-actions" style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={onOpenElection} disabled={!selectedElection}>
              Open Election Report
            </button>
            <button className="btn-secondary" onClick={onOpenTurnout}>
              Turnout Reports
            </button>
            <button className="btn-secondary" onClick={onOpenFeedback}>
              Feedback Reports
            </button>
            <button
              className="btn-secondary"
              onClick={() => {
                loadElections();
              }}
              title="Reload elections"
            >
              {loading ? "Reloading…" : "Reload"}
            </button>
            {/* New quick actions for analytics and security */}
            <button className="btn-secondary" onClick={() => navigate("/admin/analytics")}>
              Analytics Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate("/admin/security")}>
              Security Logs
            </button>
          </div>
        </div>
      </section>

      {loading && <p className="muted">Loading elections…</p>}
      {!loading && loadingError && <div className="error-banner">{loadingError}</div>}
      {!loading && !loadingError && elections.length === 0 && (
        <p className="muted">No elections found. Create an election or check your backend.</p>
      )}

      {!loading && elections.length > 0 && (
        <section className="table-section">
          <h3>Available elections</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Election</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((el) => {
                  const id = el.electionId ?? el.id ?? "";
                  return (
                    <tr key={id}>
                      <td>
                        <strong style={{ display: "block" }}>{el.name ?? el.title ?? `Election ${id}`}</strong>
                        <div className="muted" style={{ fontSize: 13 }}>
                          ID: {id}
                        </div>
                      </td>
                      <td className="muted">{el.startDate ?? el.startAt ?? "—"}</td>
                      <td className="muted">{el.endDate ?? el.endAt ?? "—"}</td>
                      <td className="muted">
                        {typeof el.electionType !== "undefined" ? String(el.electionType) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="quick-links" style={{ marginTop: 18 }}>
        <h3>Quick actions</h3>
        <div className="cards">
          <div className="card" onClick={() => navigate("/admin/reports/turnout")}>
            <strong>Voter Turnout</strong>
            <p className="muted">View turnout by election and region</p>
          </div>
          <div className="card" onClick={() => navigate("/admin/reports/election")}>
            <strong>Election Results</strong>
            <p className="muted">Summary and candidate breakdowns</p>
          </div>
          <div className="card" onClick={() => navigate("/admin/reports/feedback")}>
            <strong>Feedback</strong>
            <p className="muted">View voter feedback and ratings</p>
          </div>
          <div className="card" onClick={() => navigate("/admin/analytics")}>
            <strong>Analytics</strong>
            <p className="muted">System overview, top candidates, votes per day</p>
          </div>
          <div className="card" onClick={() => navigate("/admin/security")}>
            <strong>Security Logs</strong>
            <p className="muted">Audit trail of system events</p>
          </div>
        </div>
      </section>
    </div>
  );
}
