import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Parties.css";

export default function Parties() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");
  const location = useLocation();

  const normalize = (item) => ({
    id: item._id ?? item.id ?? item.partyId ?? item.party_id ?? null,
    name: item.name ?? item.partyName ?? item.title ?? "",
    description: item.description ?? item.desc ?? item.summary ?? "",
    symbolRaw: item.symbol ?? item.symbolRaw ?? "",
    symbolUrl: item.symbolUrl ?? item.logo ?? item.image ?? "",
    __raw: item,
  });

  const loadParties = async () => {
    try {
      setLoading(true);
      setStatus("");
      const res = await fetch("/api/parties");
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const raw = await res.json();
      const arr = Array.isArray(raw) ? raw : raw.parties ?? raw.data ?? [];
      const normalized = arr.map(normalize);
      setParties(normalized);
    } catch (err) {
      console.error("loadParties error:", err);
      setStatus("Error loading parties. See console/network for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    if (location?.state?.toast) {
      setToast(location.state.toast);
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [location]);

  const handleDelete = async (id, name) => {
    if (!id) return;
    if (!window.confirm(`Delete party "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/parties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      setToast("Party deleted successfully");
      await loadParties();
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setStatus("Failed to delete party. See console for details.");
    }
  };

  const onImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.dataset.broken = "true";
    e.currentTarget.src = "";
  };

  return (
    <div className="page-container">
      {toast && <div className="toast" role="status">{toast}</div>}

      <div className="page-header">
        <h2>Parties</h2>
        <Link to="/parties/new" className="btn-primary">Add Party</Link>
      </div>

      {status && <div className="status-msg error" role="alert">{status}</div>}

      {loading ? (
        <div className="loader">Loading...</div>
      ) : parties.length === 0 ? (
        <div className="empty-state">
          <p>No parties found.</p>
          <Link to="/parties/new" className="btn-secondary">Create your first party</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table" role="table" aria-label="Parties table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Symbol</th>
                <th scope="col">Description</th>
                <th scope="col" className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((p, idx) => {
                const key = p.id ?? `${p.name || "party"}-${idx}`;
                const id = p.id;
                const showEmoji = p.symbolRaw && !p.symbolUrl;
                return (
                  <tr key={key}>
                    <td className="cell-name">
                      <span>{p.name || <span className="muted">No name</span>}</span>
                    </td>

                    <td style={{ textAlign: "center" }}>
                      {showEmoji ? (
                        <div style={{ fontSize: 20 }}>{p.symbolRaw}</div>
                      ) : p.symbolUrl ? (
                        <img
                          src={p.symbolUrl}
                          alt={p.name ? `${p.name} symbol` : "symbol"}
                          className="symbol-img"
                          onError={onImgError}
                        />
                      ) : (
                        <span className="muted">No symbol</span>
                      )}
                    </td>

                    <td className="desc-cell">{p.description || <span className="muted">—</span>}</td>

                    <td className="actions" role="cell" aria-label={`Actions for ${p.name || 'party'}`}>
                    {id ? (
                      <div className="action-buttons" role="group" aria-label={`Actions for ${p.name || 'party'}`}>
                        <Link
                          to={`/parties/${id}/edit`}
                          className="btn-small btn-edit"
                          title={`Edit ${p.name || "party"}`}
                          aria-label={`Edit ${p.name || "party"}`}
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="btn-small btn-danger"
                          onClick={() => handleDelete(id, p.name || "this party")}
                          title={`Delete ${p.name || "party"}`}
                          aria-label={`Delete ${p.name || "party"}`}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="muted">Unavailable</span>
                    )}
                  </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
