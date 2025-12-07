// src/pages/admin/AnalyticsDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminOverview,
  getTopCandidates,
  getVoterTurnoutAnalytics,
  getVotesPerDay,
} from "../../api/analytics";
import CandidateBarChart from "../../components/charts/BarChart";
import TimeSeriesChart from "../../components/charts/TimeSeriesChart";
import "./reports.css";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [topCandidates, setTopCandidates] = useState([]);
  const [turnout, setTurnout] = useState(null);
  const [votesPerDay, setVotesPerDay] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const o = await getAdminOverview();
        if (!mounted) return;
        setOverview(o);

        const electionId = o?.latestElectionId ?? (o?.elections?.[0]?.electionId ?? null) ?? 1;
        const [tc, vt, vpd] = await Promise.all([
          getTopCandidates(electionId).catch(() => []),
          getVoterTurnoutAnalytics(electionId).catch(() => null),
          getVotesPerDay(electionId).catch(() => []),
        ]);

        if (!mounted) return;
        setTopCandidates(Array.isArray(tc) ? tc : tc?.candidates ?? []);
        setTurnout(vt);
        setVotesPerDay(Array.isArray(vpd) ? vpd : vpd?.series ?? []);
      } catch (err) {
        console.error("Analytics load failed:", err);
        if (mounted) setError("Failed to load analytics.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalVotes = useMemo(
    () => (Array.isArray(topCandidates) ? topCandidates.reduce((s, c) => s + (Number(c.votes) || 0), 0) : 0),
    [topCandidates]
  );

  if (loading) return <div className="muted">Loading analytics…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="reports-page">
      <div className="reports-container">
        <header className="reports-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="btn-secondary back-btn" onClick={() => navigate("/")} aria-label="Back to main">
              ← Back to Home
            </button>
            <div>
              <h1>Admin Analytics</h1>
              <p className="muted">Overview and trends for the latest election</p>
            </div>
          </div>
        </header>

        <section className="summary-cards">
          <div className="card" aria-label="System totals">
            <strong>System totals</strong>
            <div className="small muted">Voters: {overview?.totalVoters ?? "—"}</div>
            <div className="small muted">Elections: {overview?.totalElections ?? "—"}</div>
            <div className="small muted">Candidates: {overview?.totalCandidates ?? "—"}</div>
          </div>

          <div className="card" aria-label="Top candidates">
            <strong>Top candidates</strong>
            <div className="small muted">Total votes: {totalVotes}</div>
          </div>

          <div className="card" aria-label="Turnout">
            <strong>Turnout</strong>
            <div className="small muted">
              {turnout?.turnoutPercentage ?? (turnout?.totalVoters ? `${(((turnout?.totalVotes ?? 0) / turnout?.totalVoters) * 100).toFixed(1)}%` : "—")}
            </div>
          </div>
        </section>

        <section className="chart-section">
          <h3>Top candidates</h3>
          <div className="table-wrap chart-container">
            <div className="chart-bound chart-inner">
              <CandidateBarChart
                candidates={topCandidates.map(c => ({
                  candidateId: c.candidateId ?? c.id,
                  name: c.name,
                  totalVotes: c.votes,
                }))}
              />
            </div>
          </div>
        </section>

        <section className="chart-section">
          <h3 style={{ marginTop: 18 }}>Votes per day</h3>
          <div className="table-wrap chart-container time-series">
            <div className="chart-bound chart-inner">
              <TimeSeriesChart
                series={(votesPerDay || []).map(d => ({ label: d.date ?? d.label, value: Number(d.count ?? d.value ?? 0) }))}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
