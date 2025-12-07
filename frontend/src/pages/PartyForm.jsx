import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Parties.css";

export default function PartyForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [party, setParty] = useState({ name: "", description: "", symbolRaw: "", symbolUrl: "" });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || id === "new" || id === "undefined") return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/parties/${id}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setParty({
          name: data.name ?? data.partyName ?? data.title ?? "",
          description: data.description ?? data.desc ?? "",
          symbolRaw: data.symbol ?? "",
          symbolUrl: data.symbolUrl ?? data.logo ?? data.image ?? "",
        });
      } catch (err) {
        console.error("PartyForm load error:", err);
        setStatus("Error loading party. See console for details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(id && id !== "new" ? "Updating party..." : "Creating party...");

    try {
      const payload = {
        name: party.name,
        partyName: party.name,
        description: party.description,
        symbol: party.symbolRaw || undefined,
        symbolUrl: party.symbolUrl || undefined,
      };

      const endpoint = id && id !== "new" ? `/api/parties/${id}` : "/api/parties";
      const method = id && id !== "new" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const toastMsg = id && id !== "new" ? "Party updated successfully" : "Party created successfully";
      navigate("/parties", { replace: true, state: { toast: toastMsg } });
    } catch (err) {
      console.error("PartyForm save error:", err);
      setStatus("Save failed. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <h2>{id && id !== "new" ? "Edit Party" : "Add Party"}</h2>
          <Link to="/parties" className="link-back">Back to list</Link>
        </div>

        {status && <div className={`status-msg ${saving ? "info" : "error"}`}>{status}</div>}

        {loading ? (
          <div className="loader">Loading party...</div>
        ) : (
          <form onSubmit={handleSubmit} className="form" noValidate>
            <div className="form-row">
              <label htmlFor="name">Party name</label>
              <input
                id="name"
                type="text"
                value={party.name}
                onChange={(e) => setParty({ ...party, name: e.target.value })}
                required
                placeholder="e.g., Democratic Alliance"
              />
            </div>

            <div className="form-row">
              <label htmlFor="symbolRaw">Symbol (emoji or short text)</label>
              <input
                id="symbolRaw"
                type="text"
                value={party.symbolRaw}
                onChange={(e) => setParty({ ...party, symbolRaw: e.target.value })}
                placeholder="e.g., 🛡️ or Hand"
              />
            </div>

            <div className="form-row">
              <label htmlFor="symbolUrl">Symbol image URL (optional)</label>
              <input
                id="symbolUrl"
                type="url"
                value={party.symbolUrl}
                onChange={(e) => setParty({ ...party, symbolUrl: e.target.value })}
                placeholder="https://..."
              />
              {party.symbolUrl && (
                <div className="preview" aria-hidden="true" style={{ marginTop: 8 }}>
                  <img
                    src={party.symbolUrl}
                    alt="Symbol preview"
                    className="symbol-img large"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.dataset.broken = "true"; e.currentTarget.src = ""; }}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={party.description}
                onChange={(e) => setParty({ ...party, description: e.target.value })}
                placeholder="Short mission statement"
                rows={4}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
