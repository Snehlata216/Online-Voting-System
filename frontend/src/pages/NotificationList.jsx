// src/pages/NotificationList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllNotifications, markAsRead, deleteNotification } from "../api/notifications";
import "./NotificationList.css";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]); // always an array
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await getAllNotifications();
      // Normalize response: accept array or wrapper { notifications: [...] }
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
  }, []);

  const handleMarkRead = async (id) => {
    setProcessingId(id);
    setStatus("");
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n)));
      setStatus("Marked as read.");
    } catch (err) {
      console.error("Failed to mark as read:", err);
      setStatus(err?.response?.data?.message || "Failed to mark as read.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    setProcessingId(id);
    setStatus("");
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      setStatus("Notification deleted.");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setStatus(err?.response?.data?.message || "Failed to delete.");
    } finally {
      setProcessingId(null);
    }
  };

  const goToCreate = () => {
    navigate("/notifications/new");
  };

  return (
    <div className="notification-list-page">
      <h1>All Notifications</h1>

      <div className="toolbar">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-primary" onClick={goToCreate}>New Notification</button>
          <button className="btn-secondary" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {status && <p className="notification-status">{status}</p>}

      {loading ? (
        <p className="notification-status">Loading...</p>
      ) : !Array.isArray(notifications) || notifications.length === 0 ? (
        <p className="notification-status">No notifications yet.</p>
      ) : (
        <table className="notification-table" role="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Voter ID</th>
              <th>Title</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.notificationId}>
                <td>{n.notificationId}</td>
                <td>{n.voterId ?? "—"}</td>
                <td>{n.title}</td>
                <td className="message-cell" title={n.message}>{n.message}</td>
                <td>{n.isRead ? "Read" : "Unread"}</td>
                <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : "—"}</td>
                <td>
                  {!n.isRead && (
                    <button
                      className="btn-primary btn-small"
                      onClick={() => handleMarkRead(n.notificationId)}
                      disabled={processingId === n.notificationId}
                    >
                      {processingId === n.notificationId ? "Processing..." : "Mark as read"}
                    </button>
                  )}
                  <button
                    className="btn-secondary btn-small"
                    onClick={() => handleDelete(n.notificationId)}
                    disabled={processingId === n.notificationId}
                    style={{ marginLeft: 8 }}
                  >
                    {processingId === n.notificationId ? "Processing..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
