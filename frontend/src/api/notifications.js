// src/api/notifications.js
// Axios wrapper for notification endpoints used by admin and voter pages.

import axios from "axios";

const client = axios.create({
  baseURL: "/api/notifications",
  headers: { "Content-Type": "application/json" },
});

// Admin: create a notification (targeted or broadcast)
export const createNotification = (payload) =>
  client.post("/", payload);

// Admin: get all notifications
export const getAllNotifications = () =>
  client.get("/", {
    params: { t: Date.now() }, // cache-busting
    headers: { "Cache-Control": "no-cache" },
  });

// Admin: delete a notification by id
export const deleteNotification = (id) =>
  client.delete(`/${id}`);

// Voter: get notifications for a voterId (includes broadcast)
export const getNotificationsByVoter = (voterId) =>
  client.get(`/voter/${voterId}`, {
    params: { t: Date.now() },
    headers: { "Cache-Control": "no-cache" },
  });

// Voter: get unread notification count (for menu badge)
export const getUnreadCount = (voterId) =>
  client.get(`/unread-count/${voterId}`, {
    params: { t: Date.now() },
    headers: { "Cache-Control": "no-cache" },
  });

// Mark a notification as read
export const markAsRead = (id) =>
  client.put(`/${id}/read`);

export default client;
