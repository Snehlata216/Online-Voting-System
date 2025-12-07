// src/pages/VoterNotifications.jsx
import React, { useEffect, useState, useContext } from "react";
import { getNotificationsByVoter, markAsRead } from "../api/notifications";
import { AuthContext } from "../context/AuthContext";
import "./VoterNotifications.css";

export default function VoterNotifications() {
  const { user } = useContext(AuthContext);
  const voterId = user?.voterId;

  const [notifications, setNotifications] = useState([]); // ensure array
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const load = async () => {
    if (!voterId) {
      setStatus("No voterId available.");
      setNotifications([]);
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const res = await getNotificationsByVoter(voterId);
      // Debug: inspect response shape
      console.log("getNotificationsByVoter response:", res?.data);

      // Accept either an array or an object wrapper { notifications: [...] }
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.notifications)
        ? res.data.notifications
        : [];

      setNotifications(items);

      if (items.length === 0) setStatus("No notifications yet.");
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setStatus(err?.response?.data?.message || "Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // optional: poll or subscribe to real-time updates
  }, [voterId]);

  const handleMarkRead = async (id) => {
    setProcessingId(id);
    setStatus("");
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      setStatus("Marked as read.");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      setStatus(err?.response?.data?.message || "Failed to mark as read.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="voter-notifications-page">
      <h1>My Notifications</h1>

      <div className="toolbar">
        <button className="btn-secondary" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {status && <p className="notification-status">{status}</p>}

      {loading ? (
        <p className="notification-status">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="notification-status">No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {Array.isArray(notifications) &&
            notifications.map((n) => (
              <li key={n.notificationId} className={`notification-item ${n.isRead ? "read" : "unread"}`}>
                <div className="item-header">
                  <span className="item-title">{n.title}</span>
                  <span className="item-date">{n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}</span>
                </div>
                <p className="item-message">{n.message}</p>
                {!n.isRead && (
                  <button
                    className="btn-primary btn-small"
                    onClick={() => handleMarkRead(n.notificationId)}
                    disabled={processingId === n.notificationId}
                  >
                    {processingId === n.notificationId ? "Processing..." : "Mark as read"}
                  </button>
                )}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
