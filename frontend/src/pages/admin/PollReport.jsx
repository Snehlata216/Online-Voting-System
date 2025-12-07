// src/pages/admin/PollReport.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPollReport } from "../../api/reports";
import DonutChart from "../../components/charts/DonutChart";
import { downloadCsv } from "../../utils/downloadCsv";
import { mapPollToCsvRows, csvFilename } from "../../utils/reportMappers";
import "./reports.css";

export default function PollReport() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    let mounted = true;
    setLoading(true);
    getPollReport(pollId)
      .then((res) => { if (!mounted) return; setPoll(res.data); })
      .catch((err) => { console.error(err); setPoll(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [pollId]);

  const onExport = () => {
    const rows = mapPollToCsvRows(poll?.results ?? []);
    if (!rows.length) return alert("No poll results to export");
    downloadCsv(csvFilename(`poll-${pollId}`), rows);
  };

  const chartData = (poll?.results || []).map((r) => ({ name: r.text, value: r.votes }));

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Poll Report</h1>
        <p className="muted">Results for poll {pollId}</p>
      </header>

      {loading && <div className="loading">Loading…</div>}

      {!loading && poll && (
        <>
          <section className="summary-cards">
            <div className="card">
              <strong>{poll.question}</strong>
              <div className="small muted">Total votes: {poll.totalVotes ?? 0}</div>
            </div>
            <div className="card">
              <strong>Export</strong>
              <div style={{ marginTop: 8 }}>
                <button className="btn-primary" onClick={onExport}>Export CSV</button>
              </div>
            </div>
          </section>

          <section className="chart-section">
            <DonutChart data={chartData} />
          </section>

          <section className="table-section">
            <h3>Options</h3>
            <div className="table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Votes</th>
                    <th>Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {(poll.results || []).map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.text}</td>
                      <td>{r.votes}</td>
                      <td>{r.percentage ?? "—"}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {!loading && !poll && <p className="muted">No poll data available.</p>}
    </div>
  );
}
