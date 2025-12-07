// src/pages/Results.jsx
import React, { useEffect, useState, useRef } from "react";
import { listElections } from "../api/elections";
import { getElectionResults } from "../api/results";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Results.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

function downloadResultsCsv(electionTitle, items) {
  const safeTitle = (electionTitle || "results").replace(/[^\w\-]+/g, "_");
  const headers = ["candidateId", "candidateName", "party", "voteCount", "isWinner"];
  const rows = items.map((r) => [
    r.candidateId ?? "",
    `"${(r.candidateName ?? "").replace(/"/g, '""')}"`,
    `"${(r.party ?? "").replace(/"/g, '""')}"`,
    Number(r.voteCount ?? 0),
    r.isWinner ? "true" : "false",
  ]);
  const csv = [headers.join(","), ...rows.map((a) => a.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeTitle}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Results() {
  const chartRef = useRef(null);

  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [selectedElectionTitle, setSelectedElectionTitle] = useState("");
  const [results, setResults] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [chartType, setChartType] = useState("pie");
  const [loadingElections, setLoadingElections] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadElections();
    const onResize = () => chartRef.current?.update?.();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => chartRef.current?.update?.(), 60);
    return () => clearTimeout(t);
  }, [results, chartType]);

  // Load all elections (no filtering, no per-election extra requests)
  const loadElections = async () => {
    setLoadingElections(true);
    try {
      const res = await listElections();
      const all = Array.isArray(res?.data) ? res.data : [];
      setElections(all);
      // Do not auto-select; user chooses which election to load
      setSelectedElectionId("");
      setSelectedElectionTitle("");
      setResults([]);
      setStatusMsg("");
    } catch (err) {
      console.error("Error loading elections:", err);
      setStatusMsg("Failed to load elections");
    } finally {
      setLoadingElections(false);
    }
  };

  const loadResults = async (rawId) => {
    if (!rawId && rawId !== 0) return;
    setLoadingResults(true);
    setStatusMsg("Loading results...");
    try {
      const id = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const res = await getElectionResults(id);
      const data = Array.isArray(res?.data) ? res.data : [];
      setResults(data);
      setStatusMsg("");
      const found = elections.find((e) => (e.electionId ?? e.id) === id);
      if (found) setSelectedElectionTitle(found.title ?? found.name ?? "");
      setTimeout(() => chartRef.current?.update?.(), 60);
    } catch (err) {
      console.error("Error loading results:", err);
      setStatusMsg("Failed to load results");
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Derived values
  const totalVotes = results.reduce((sum, r) => sum + (Number(r.voteCount) || 0), 0);
  const hasVotes = results.some((r) => Number(r.voteCount) > 0);

  // Sort: by votes if any, otherwise alphabetically
  const sortedResults = [...results];
  if (hasVotes) {
    sortedResults.sort((a, b) => (Number(b.voteCount) || 0) - (Number(a.voteCount) || 0));
  } else {
    sortedResults.sort((a, b) => (a.candidateName || "").localeCompare(b.candidateName || ""));
  }

  const labels = sortedResults.map((r) => r.candidateName);
  const votes = sortedResults.map((r) => Number(r.voteCount) || 0);
  const colors = sortedResults.map((r) =>
    r.isWinner && Number(r.voteCount) > 0 ? "rgba(16,185,129,0.95)" : "rgba(59,130,246,0.95)"
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Votes",
        data: votes,
        backgroundColor: colors,
        borderColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 2,
    layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: selectedElectionTitle ? `Election Results — ${selectedElectionTitle}` : "Election Results",
        color: "#e5e7eb",
        font: { size: 18, weight: "600" },
        padding: { top: 6, bottom: 12 },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (ctx) => {
            const value = Number(ctx.parsed);
            if (chartType === "pie" && totalVotes > 0) {
              const pct = ((value / totalVotes) * 100).toFixed(1);
              return `${ctx.label}: ${value} (${pct}%)`;
            }
            return `${ctx.label}: ${value}`;
          },
        },
        bodyFont: { size: 13 },
        titleFont: { size: 13, weight: "600" },
      },
      datalabels: {
        color: "#fff",
        font: { size: 13, weight: "700" },
        clamp: false,
        clip: false,
        formatter: (value) => (totalVotes > 0 ? `${((value / totalVotes) * 100).toFixed(1)}%` : value),
      },
    },
    elements: { arc: { borderWidth: 1 } },
    scales:
      chartType === "bar"
        ? {
            x: { ticks: { color: "#e5e7eb", font: { size: 12 } }, grid: { display: false } },
            y: { ticks: { color: "#e5e7eb", font: { size: 12 } }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true, precision: 0 },
          }
        : undefined,
  };

  const legendItems = sortedResults.map((r, idx) => {
    const v = Number(r.voteCount) || 0;
    const pct = totalVotes > 0 ? ((v / totalVotes) * 100).toFixed(1) : "0.0";
    return {
      id: r.candidateId ?? idx,
      name: r.candidateName,
      votes: v,
      pct,
      color: colors[idx] ?? "#999",
      winner: !!r.isWinner && v > 0,
    };
  });

  return (
    <div className="results-root">
      <div className="results-container">
        <header className="results-header">
          <div className="results-header-left">
            <h1 className="results-title">Election Results</h1>
            <p className="results-muted">{selectedElectionTitle}</p>
          </div>

          <div className="results-header-right">
            <button
              type="button"
              className="results-download"
              onClick={() => downloadResultsCsv(selectedElectionTitle, results)}
              disabled={!results.length}
              title={results.length ? "Download results CSV" : "No results to download"}
            >
              ⬇️ Download CSV
            </button>
          </div>
        </header>

        <div className="results-section">
          <label htmlFor="election-select" className="results-label">Select election</label>

          <select
            id="election-select"
            value={selectedElectionId}
            onChange={(e) => {
              const idRaw = e.target.value;
              const id = isNaN(Number(idRaw)) ? idRaw : Number(idRaw);
              setSelectedElectionId(id);
              const found = elections.find((el) => (el.electionId ?? el.id) === id);
              setSelectedElectionTitle(found?.title ?? found?.name ?? "");
              loadResults(id);
            }}
            className="results-select"
            aria-label="Select election"
          >
            <option value="">-- Choose Election --</option>
            {elections.map((el) => (
              <option key={el.electionId ?? el.id} value={el.electionId ?? el.id}>
                {el.title ?? el.name}
              </option>
            ))}
          </select>

          {!selectedElectionId && (
            <p className="results-status" style={{ marginTop: 8 }}>
              Select an election above to load its results.
            </p>
          )}
        </div>

        {/* Simple election list (no extra requests) */}
        <div className="election-list" role="list" aria-label="Available elections">
          {loadingElections ? (
            <div className="results-status">Loading elections…</div>
          ) : (
            elections.map((el) => {
              const id = el.electionId ?? el.id;
              const isSelected = id === selectedElectionId;
              return (
                <button
                  key={id}
                  className={`election-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedElectionId(id);
                    setSelectedElectionTitle(el.title ?? el.name ?? "");
                    loadResults(id);
                  }}
                  role="listitem"
                  aria-pressed={isSelected}
                >
                  <div className="election-item-left">
                    <div className="election-title">{el.title ?? el.name}</div>
                    <div className="election-meta">
                      <span className={`election-badge ${el.status ?? ""}`}>{el.status ?? "unknown"}</span>
                    </div>
                  </div>
                  <div className="election-item-right">
                    <span className="chev">{isSelected ? "●" : "○"}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {statusMsg && <p className="results-status">{statusMsg}</p>}

        {sortedResults.length > 0 && (
          <>
            <div className="results-grid" style={{ marginTop: 14 }}>
              {sortedResults.map((r) => (
                <div className="results-card" key={r.candidateId}>
                  <h3 className="results-card-title">{r.candidateName}</h3>
                  <p className="results-muted">{r.party}</p>
                  <p>
                    <strong>Votes:</strong> {r.voteCount}
                  </p>
                  {r.isWinner && Number(r.voteCount) > 0 && <p className="results-winner">🏆 Winner</p>}
                </div>
              ))}
            </div>

            <div className="results-toggle" style={{ marginTop: 18 }}>
              <button className={chartType === "bar" ? "active" : ""} onClick={() => setChartType("bar")}>
                Bar Chart
              </button>
              <button className={chartType === "pie" ? "active" : ""} onClick={() => setChartType("pie")}>
                Pie Chart
              </button>
            </div>

            {loadingResults ? (
              <div style={{ marginTop: 12 }}>
                <div className="skeleton" style={{ width: "60%" }} />
                <div className="skeleton" style={{ width: "40%" }} />
                <div className="skeleton" style={{ width: "80%" }} />
              </div>
            ) : hasVotes ? (
              <div className="results-chart-container" style={{ marginTop: 18 }}>
                <div className="results-chart-bound">
                  <div className="results-chart-inner">
                    {chartType === "bar" ? (
                      <Bar ref={chartRef} data={chartData} options={chartOptions} />
                    ) : (
                      <Pie ref={chartRef} data={chartData} options={chartOptions} />
                    )}
                  </div>

                  <div className="results-legend" role="list" aria-label="Candidates legend">
                    {legendItems.map((it) => (
                      <div className="results-legend-item" key={it.id} role="listitem">
                        <span className="results-legend-swatch" style={{ background: it.color }} />
                        <div className="results-legend-text">
                          <div className="results-legend-name">
                            <strong>{it.name}</strong>
                            {it.winner && <span className="results-legend-winner">🏆</span>}
                          </div>
                          <div className="results-legend-meta">
                            <span className="results-legend-pct">{it.pct}%</span>
                            <span className="results-legend-votes"> • {it.votes} votes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="results-status" style={{ marginTop: 12 }}>
                No votes recorded yet for this election.
              </p>
            )}
          </>
        )}

        {!sortedResults.length && !statusMsg && !loadingResults && (
          <p className="results-status" style={{ marginTop: 12 }}>
            No candidates or results available for the selected election.
          </p>
        )}
      </div>
    </div>
  );
}
