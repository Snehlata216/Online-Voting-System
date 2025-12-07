// src/pages/NotificationForm.jsx
// Admin page to create notifications. Uses createNotification API.
// Optional voterId targets a single voter; leave empty to broadcast.

import React, { useState } from "react";
import { createNotification } from "../api/notifications";
import "./NotificationForm.css";

export default function NotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [voterId, setVoterId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!title.trim() || !message.trim()) {
      setStatus("Title and message are required.");
      return;
    }

    const payload = { title: title.trim(), message: message.trim(), voterId: voterId.trim() || null };

    setLoading(true);
    try {
      await createNotification(payload);
      setStatus("Notification created.");
      setTitle("");
      setMessage("");
      setVoterId("");
    } catch (err) {
      console.error(err);
      setStatus(err?.response?.data?.message || "Failed to create notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-form-page">
      <h1>Create Notification</h1>
      <form className="notification-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />

        <label htmlFor="message">Message</label>
        <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Message" required />

        <label htmlFor="voterId">Target Voter ID (optional)</label>
        <input id="voterId" value={voterId} onChange={(e) => setVoterId(e.target.value)} placeholder="Leave empty to broadcast" />

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send Notification"}
          </button>
        </div>

        {status && <p className="notification-status">{status}</p>}
      </form>
    </div>
  );
}
