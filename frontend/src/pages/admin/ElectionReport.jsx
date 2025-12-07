// src/pages/admin/ElectionReport.jsx
// Election report page: fetches summary, candidates and turnout,
// renders summary cards, charts, tables and CSV export buttons.
// Includes a Back button to return to /admin/reports.
// Comments explain key blocks and defensive checks.

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getElectionSummary,
  getCandidateVoteReport,
  getVoterTurnout,
} from "../../api/reports";

// Chart components (ensure these files exist at src/components/charts)
import CandidateBarChart from "../../components/charts/BarChart";
import DonutChart from "../../components/charts/DonutChart";
import TimeSeriesChart from "../../components/charts/TimeSeriesChart";

import { downloadCsv } from "../../utils/downloadCsv";
import "./reports.css";

export default function ElectionReport() {
  const { electionId } = useParams();
  const navigate = useNavigate();

  // Local state
  const [summary, setSummary] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [turnout, setTurnout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data on mount or when electionId changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    (async () => {
      try {
        // Parallel requests for speed; each call is defensive (returns null on error)
        const [sumRes, candRes, turnoutRes] = await Promise.all([
          getElectionSummary(electionId).catch((e) => {
            console.error("getElectionSummary error:", e);
            return null;
          }),
          getCandidateVoteReport(electionId).catch((e) => {
            console.error("getCandidateVoteReport error:", e);
            return null;
          }),
          getVoterTurnout(electionId).catch((e) => {
            console.error("getVoterTurnout error:", e);
            return null;
          }),
        ]);

        if (!mounted) return;

        // Normalize shapes: backend may return { election: {...} } or the object directly
        const normalizedSummary = sumRes?.election ?? sumRes ?? null;
        const normalizedCandidates = candRes?.candidates ?? candRes ?? [];
        const normalizedTurnout = turnoutRes ?? null;

        setSummary(normalizedSummary);
        setCandidates(Array.isArray(normalizedCandidates) ? normalizedCandidates : []);
        setTurnout(normalizedTurnout);
      } catch (err) {
        console.error("Unexpected fetch error:", err);
        if (mounted) setError("Failed to load report data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [electionId]);

  // Derived values: total votes and normalized rows for tables/CSV
  const totalVotes = useMemo(() => {
    if (!Array.isArray(candidates) || candidates.length === 0) return 0;
    return candidates.reduce((sum, c) => sum + (Number(c.totalVotes) || 0), 0);
  }, [candidates]);

  const candidateRows = useMemo(
    () =>
      candidates.map((c) => {
        const votes = Number(c.totalVotes) || 0;
        return {
          candidateId: c.candidateId ?? c.id ?? "",
          name: c.name ?? c.fullName ?? "",
          votes,
          percent: totalVotes > 0 ? `${((votes / totalVotes) * 100).toFixed(1)}%` : "0.0%",
        };
      }),
    [candidates, totalVotes]
  );

  const turnoutRows = useMemo(() => {
    if (!turnout) return [];
    return Array.isArray(turnout) ? turnout : [turnout];
  }, [turnout]);

  // Loading / error states
  if (loading) return <div className="muted">Loading report…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  // CSV helpers
  const onDownloadCandidates = () => {
    const rows = candidateRows.map((r) => ({
      candidateId: r.candidateId,
      name: r.name,
      votes: r.votes,
      percent: r.percent,
    }));
    downloadCsv(`election-${electionId}-candidates.csv`, rows);
  };

  const onDownloadTurnout = () => {
    downloadCsv(`election-${electionId}-turnout.csv`, turnoutRows);
  };

  return (
    <div className="reports-page">
      {/* Header with Back button */}
      <header
        className="reports-header"
        style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Back button navigates to reports list; use navigate(-1) if you prefer history back */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/reports")}
            aria-label="Back to reports"
            style={{ marginRight: 6 }}
          >
            ← Back to Reports
          </button>

          <div>
            <h1>Election Report</h1>
            <p className="muted">Election ID: {electionId}</p>
          </div>
        </div>

        {/* Right-side quick controls (kept minimal) */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </header>

      {/* Summary cards and CSV buttons */}
      <section className="summary-cards" aria-label="Summary cards">
        <div className="card" role="region" aria-label="Election summary">
          <strong>{summary?.title ?? summary?.name ?? `Election ${electionId}`}</strong>
          <div className="small muted">Start: {summary?.startDate ?? "—"}</div>
          <div className="small muted">End: {summary?.endDate ?? "—"}</div>
          <div className="small muted">Total votes: {totalVotes || "—"}</div>
        </div>

        <div className="card" role="region" aria-label="Turnout summary">
          <strong>Turnout</strong>
          <div className="small muted">
            {turnoutRows[0]
              ? turnoutRows[0].turnoutPercentage ??
                `${(((turnoutRows[0].totalVotes ?? 0) / (turnoutRows[0].totalVoters ?? 1)) * 100).toFixed(1)}%`
              : "—"}
          </div>
          <div className="small muted">Voters: {turnoutRows[0]?.totalVoters ?? "—"}</div>
        </div>

        {/* CSV buttons grouped in the summary area for discoverability */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-secondary" onClick={onDownloadCandidates} aria-label="Download candidates CSV">
            Download Candidates CSV
          </button>

          <button className="btn-secondary" onClick={onDownloadTurnout} aria-label="Download turnout CSV">
            Download Turnout CSV
          </button>
        </div>
      </section>

      {/* Charts section: bar, donut, and optional time series */}
      <section className="chart-section" aria-label="Charts">
        <h3>Candidate votes</h3>
        <div className="table-wrap" style={{ padding: 12 }}>
          {/* Bar chart shows vote counts and data labels (if plugin enabled) */}
          <CandidateBarChart candidates={candidates} />
        </div>

        <h3 style={{ marginTop: 18 }}>Vote share</h3>
        <div className="table-wrap" style={{ padding: 12 }}>
          <DonutChart candidates={candidates} />
        </div>

        {turnoutRows.length > 0 && (
          <>
            <h3 style={{ marginTop: 18 }}>Turnout over time</h3>
            <div className="table-wrap" style={{ padding: 12 }}>
              <TimeSeriesChart
                series={
                  turnoutRows.map((t, i) => ({
                    label: t.label ?? `T${i + 1}`,
                    value: Number(t.totalVotes ?? t.votes ?? 0),
                  })) || []
                }
              />
            </div>
          </>
        )}
      </section>

      {/* Candidates table with clear percent and votes columns */}
      <section className="table-section" aria-label="Candidates table" style={{ marginTop: 18 }}>
        <h3>Candidates</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Votes</th>
                <th>Percent</th>
              </tr>
            </thead>
            <tbody>
              {candidateRows.map((r) => (
                <tr key={r.candidateId}>
                  <td>
                    <strong>{r.name}</strong>
                    <span className="candidate-id">ID: {r.candidateId}</span>
                  </td>
                  <td className="candidate-votes">{r.votes}</td>
                  <td className="candidate-percent">{r.percent}</td>
                </tr>
              ))}
              {candidateRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Turnout raw data for debugging; keep compact */}
      <section className="table-section" aria-label="Turnout details" style={{ marginTop: 18 }}>
        <h3>Turnout</h3>
        <div className="table-wrap">
          <pre style={{ margin: 0 }}>{JSON.stringify(turnoutRows, null, 2)}</pre>
        </div>
      </section>
    </div>
  );
}
