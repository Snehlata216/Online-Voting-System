// src/pages/admin/SecurityLogs.jsx
// Admin security logs: lists events and allows quick logging (optional).
import React, { useEffect, useState } from "react";
import { getAllLogs, logSecurityEvent } from "../../api/security";
import "./reports.css";

export default function SecurityLogs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const data = await getAllLogs();
        if (!mounted) return;
        setLogs(Array.isArray(data) ? data : data?.logs ?? []);
      } catch (err) {
        console.error("Load logs failed:", err);
        if (mounted) setError("Failed to load security logs.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onLog = async () => {
    try {
      const payload = { type: "manual", message: note || "Manual log", timestamp: new Date().toISOString() };
      await logSecurityEvent(payload);
      setNote("");
      const data = await getAllLogs();
      setLogs(Array.isArray(data) ? data : data?.logs ?? []);
    } catch (err) {
      console.error("Log event failed:", err);
      alert("Failed to log event");
    }
  };

  if (loading) return <div className="muted">Loading security logs…</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="reports-page">
      <header className="reports-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1>Security logs</h1>
          <p className="muted">Audit trail of important events</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Log note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input"
            aria-label="Log note"
            style={{ minWidth: 220 }}
          />
          <button className="btn-secondary" onClick={onLog}>Log event</button>
        </div>
      </header>

      <section className="table-section" aria-label="Logs list">
        <div className="table-wrap">
          {logs.length === 0 ? (
            <div className="muted">No logs found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={l.id ?? i}>
                    <td>{l.type ?? "—"}</td>
                    <td style={{ maxWidth: 640, whiteSpace: "normal" }}>{l.message ?? "—"}</td>
                    <td>{l.timestamp ? new Date(l.timestamp).toLocaleString() : "—"}</td>
                    <td>{l.userId ?? l.username ?? "—"}</td>
                    <td>{l.ip ?? "—"}</td>
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
