// src/pages/PollForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Polls.css";

export default function PollForm() {
  // Accept either param name: pollId (preferred) or id (legacy)
  const params = useParams();
  const pollId = params.pollId ?? params.id;
  const navigate = useNavigate();

  const [poll, setPoll] = useState({
    question: "",
    options: [{ text: "" }, { text: "" }],
    isActive: true,
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function safeReadText(response) {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }

  function normalizeOptionsForForm(options) {
    if (!Array.isArray(options)) return [{ text: "" }, { text: "" }];
    return options.map((o) => (typeof o === "string" ? { text: o } : { text: o.text ?? "" }));
  }

  function buildPayloadFromForm(p) {
    const cleaned = (p.options || [])
      .map((o) => (o?.text || "").trim())
      .filter((t) => t.length > 0)
      .map((t) => ({ text: t, votes: 0 }));
    return {
      question: String(p.question || "").trim(),
      options: cleaned,
      isActive: Boolean(p.isActive),
      expiresAt: p.expiresAt || null,
    };
  }

  useEffect(() => {
    if (!pollId) return; // Create mode

    const load = async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch(`/api/polls/${pollId}`, { cache: "no-store" });
        if (res.status === 404) {
          setStatus("Poll not found (404). It may have been deleted.");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const txt = await safeReadText(res);
          throw new Error(txt || `Failed to load poll (${res.status})`);
        }
        const data = await res.json();

        const resolvedId = data.pollId ?? data.id ?? data._id ?? pollId;

        setPoll({
          question: data.question ?? "",
          options: normalizeOptionsForForm(data.options),
          isActive: Boolean(data.isActive),
          expiresAt: data.expiresAt ? String(data.expiresAt).slice(0, 16) : "",
          pollId: resolvedId, // for debug
        });
      } catch (err) {
        console.error("load poll error:", err);
        setStatus("Error loading poll: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [pollId]);

  const updateOption = (idx, value) => {
    const next = [...poll.options];
    next[idx] = { text: value };
    setPoll({ ...poll, options: next });
  };

  const addOption = () => setPoll({ ...poll, options: [...poll.options, { text: "" }] });

  const removeOption = (idx) => setPoll({ ...poll, options: poll.options.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(pollId ? "Updating poll..." : "Creating poll...");

    try {
      const payload = buildPayloadFromForm(poll);
      if (!payload.question) throw new Error("Question cannot be empty.");
      if (!Array.isArray(payload.options) || payload.options.length < 2) {
        throw new Error("Provide at least 2 valid options.");
      }

      if (!pollId) {
        const res = await fetch("/api/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          cache: "no-store",
        });
        if (!res.ok) {
          const txt = await safeReadText(res);
          throw new Error(`Create failed ${res.status}: ${txt || res.statusText}`);
        }
        navigate("/polls", { replace: true, state: { toast: "Poll created" } });
        return;
      }

      const res = await fetch(`/api/polls/${pollId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await safeReadText(res);
        throw new Error(`Update failed ${res.status}: ${txt || res.statusText}`);
      }

      navigate("/polls", { replace: true, state: { toast: "Poll saved" } });
    } catch (err) {
      console.error("save poll error:", err);
      setStatus(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const isEdit = Boolean(pollId);

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <h2>{isEdit ? "Edit Poll" : "Create Poll"}</h2>
          <Link to="/polls" className="link-back">Back to polls</Link>
        </div>

        {status && (
          <div className={`status-msg ${saving ? "info" : "error"}`} role="alert">
            {status}
          </div>
        )}

        {loading ? (
          <div className="loader">Loading poll...</div>
        ) : (
          <form onSubmit={handleSubmit} className="form" noValidate>
            {/* Question */}
            <div className="form-row">
              <label htmlFor="question">Question</label>
              <input
                id="question"
                type="text"
                value={poll.question}
                onChange={(e) => setPoll({ ...poll, question: e.target.value })}
                required
                placeholder="e.g., Who should be class representative?"
                aria-describedby="question-help"
              />
              <small id="question-help" className="muted">
                Keep it clear and unbiased.
              </small>
            </div>

            {/* Options */}
            <div className="form-row">
              <label>Options</label>

              <div className="options-group">
                {poll.options.map((opt, idx) => (
                  <div className="option-row" key={idx}>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      required
                      aria-label={`Option ${idx + 1}`}
                    />

                    {poll.options.length > 2 && (
                      <button
                        type="button"
                        className="btn-danger btn-small remove-option"
                        onClick={() => removeOption(idx)}
                        aria-label={`Remove option ${idx + 1}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-secondary btn-small add-option"
                onClick={addOption}
                aria-label="Add option"
              >
                Add Option
              </button>
            </div>

            {/* Expires At */}
            <div className="form-row">
              <label htmlFor="expiresAt">Expires At</label>
              <input
                id="expiresAt"
                type="datetime-local"
                value={poll.expiresAt}
                onChange={(e) => setPoll({ ...poll, expiresAt: e.target.value })}
              />
              <small className="muted">If left empty, the poll won’t expire automatically.</small>
            </div>

            {/* Active switch */}
            <div className="form-row inline">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={poll.isActive}
                  onChange={(e) => setPoll({ ...poll, isActive: e.target.checked })}
                  aria-checked={poll.isActive}
                  aria-label="Poll active"
                />
                <span className="slider" />
              </label>
              <span className="switch-label">Active</span>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" disabled={saving} aria-busy={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
