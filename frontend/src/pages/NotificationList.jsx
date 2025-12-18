// src/pages/NotificationList.jsx
// Admin view: responsive table of all notifications.
// Expects GET /api/notifications to return an array.

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NotificationList.css";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setStatus("");
      try {
        const res = await axios.get("/api/notifications");
        const data = Array.isArray(res.data) ? res.data : res.data?.notifications ?? [];
        setNotifications(data);
        if (!data.length) setStatus("No notifications found.");
      } catch (err) {
        console.error("Failed to load notifications", err);
        setStatus("❌ Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="nl-root">
      <div className="nl-container">
        <h1 className="nl-title">All Notifications</h1>
        {loading && <p className="nl-status">Loading...</p>}
        {status && <p className="nl-status">{status}</p>}

        {!loading && notifications.length > 0 && (
          <div className="nl-table-wrap">
            <table className="nl-table" role="table" aria-label="Notifications">
              <thead>
                <tr>
                  <th>Title</th>
                  <th className="hide-sm">Message</th>
                  <th>Time</th>
                  <th className="hide-sm">Target</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n) => {
                  const id = n.notificationId ?? n.id ?? n.notificationId;
                  const target = n.voterId ?? (n.targetVoterIds ? (Array.isArray(n.targetVoterIds) ? `${n.targetVoterIds.length} voter(s)` : String(n.targetVoterIds)) : "All voters");
                  const isRead = typeof n.isRead === "boolean" ? n.isRead : (n.isRead === 1 || n.isRead === "1");
                  return (
                    <tr key={id} className={isRead ? "read" : "unread"}>
                      <td className="td-title">{n.title}</td>
                      <td className="td-message hide-sm">{n.message}</td>
                      <td className="td-time">{n.createdAt ? new Date(n.createdAt).toLocaleString() : "-"}</td>
                      <td className="td-target hide-sm">{target}</td>
                      <td className="td-read">{isRead ? "Yes" : "No"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
