// src/pages/VoterNotifications.jsx
// Voter page: fetches notifications for a voterId and includes broadcasts.
// Accepts voterId as a prop OR falls back to AuthContext.user.voterId.

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "./VoterNotifications.css";
import { AuthContext } from "../context/AuthContext.jsx";

export default function VoterNotifications({ voterId: propVoterId }) {
  const { user } = useContext(AuthContext);
  // Prefer prop, then context, then null
  const voterId = propVoterId ?? user?.voterId ?? null;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  // Debugging: shows whether prop or context provided the id
  useEffect(() => {
    console.log("VoterNotifications mounted — propVoterId:", propVoterId, "context voterId:", user?.voterId);
  }, [propVoterId, user?.voterId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setStatus("");

      if (!voterId) {
        setStatus("No voterId provided. Please sign in.");
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/notifications/voter/${voterId}`, {
          params: { t: Date.now() },
          headers: { "Cache-Control": "no-cache" },
        });

        console.log("RAW notifications response:", res.status, res.data);

        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.notifications)
          ? res.data.notifications
          : [];

        if (!data.length) {
          setStatus("No notifications found.");
          setNotifications([]);
          setLoading(false);
          return;
        }

        const normalized = data.map((n, idx) => ({
          id: n.notificationId ?? n.id ?? idx,
          title: n.title ?? "Untitled",
          message: n.message ?? "",
          createdAt: n.createdAt ? new Date(n.createdAt).toLocaleString() : null,
          isRead: typeof n.isRead === "boolean" ? n.isRead : (n.isRead === 1 || n.isRead === "1"),
        }));

        console.log("Normalized notifications:", normalized);
        setNotifications(normalized);
      } catch (err) {
        console.error("Failed to load voter notifications", err);
        setStatus("❌ Failed to load notifications. Please try again.");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [voterId]);

  const markRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  return (
    <main className="vn-root">
      <section className="vn-container" aria-labelledby="vn-title">
        <h1 id="vn-title" className="vn-title">Your Notifications</h1>

        {loading && <p className="vn-status">Loading...</p>}
        {status && <p className="vn-status" aria-live="polite">{status}</p>}

        {!loading && notifications.length > 0 && (
          <ul className="vn-list" aria-label="Notifications list">
            {notifications.map((n) => (
              <li key={n.id} className={`vn-item ${n.isRead ? "read" : "unread"}`} tabIndex={0}>
                <div className="vn-header">
                  <h3>{n.title}</h3>
                  {n.createdAt && <span className="vn-time">{n.createdAt}</span>}
                </div>
                <p className="vn-message">{n.message}</p>
                {!n.isRead && (
                  <button className="vn-mark" onClick={() => markRead(n.id)}>
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
