// src/pages/NotificationForm.jsx
// Admin page to create notifications. Broadcast by default; toggle to target specific voters.
// Sends payload: { title, message, targetVoterIds: null | [ids] }

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NotificationForm.css";

export default function NotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetToggle, setTargetToggle] = useState(false);
  const [selectedVoterIds, setSelectedVoterIds] = useState([]);
  const [voters, setVoters] = useState([]);
  const [loadingVoters, setLoadingVoters] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch voters only when admin enables targeting
  useEffect(() => {
    const loadVoters = async () => {
      if (!targetToggle) return;
      setLoadingVoters(true);
      try {
        const res = await axios.get("/api/voters");
        setVoters(Array.isArray(res.data) ? res.data : res.data?.voters ?? []);
      } catch (err) {
        console.error("Failed to load voters", err);
        setStatus("❌ Failed to load voters");
      } finally {
        setLoadingVoters(false);
      }
    };
    loadVoters();
  }, [targetToggle]);

  const onSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setSelectedVoterIds(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

    const payload = {
      title,
      message,
      targetVoterIds: targetToggle && selectedVoterIds.length ? selectedVoterIds : null,
    };

    try {
      await axios.post("/api/notifications", payload);
      setStatus("✅ Notification sent");
      setTitle("");
      setMessage("");
      setSelectedVoterIds([]);
      setTargetToggle(false);
    } catch (err) {
      console.error("Failed to send notification", err);
      setStatus("❌ Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="nf-root">
      <div className="nf-card">
        <h1 className="nf-title">Create Notification</h1>

        <form className="nf-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            required
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message"
            rows={5}
            required
          />

          <div className="nf-toggle-row">
            <label htmlFor="targetToggle" className="nf-toggle-label">Target specific voters</label>
            <input
              id="targetToggle"
              type="checkbox"
              checked={targetToggle}
              onChange={(e) => {
                setTargetToggle(e.target.checked);
                if (!e.target.checked) setSelectedVoterIds([]);
              }}
            />
          </div>

          {targetToggle && (
            <>
              <label htmlFor="targetVoterIds">Target Voter ID (multi-select)</label>
              <select
                id="targetVoterIds"
                multiple
                value={selectedVoterIds}
                onChange={onSelectChange}
                className="nf-select"
                aria-label="Select voters"
              >
                {loadingVoters ? (
                  <option>Loading voters…</option>
                ) : (
                  voters.map((v) => (
                    <option key={v.voterId ?? v.id} value={String(v.voterId ?? v.id)}>
                      {v.voterId ?? v.id} — {v.name ?? v.fullName ?? "Unnamed"}
                    </option>
                  ))
                )}
              </select>
              <p className="nf-hint">
                {selectedVoterIds.length ? `Selected ${selectedVoterIds.length} voter(s)` : "No voters selected"}
              </p>
            </>
          )}

          {!targetToggle && <p className="nf-hint">Broadcasting to all voters</p>}

          <button className="nf-btn" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Notification"}
          </button>

          {status && <p className="nf-status">{status}</p>}
        </form>
      </div>
    </div>
  );
}
