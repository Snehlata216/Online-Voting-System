// src/api/notifications.js
// Axios wrapper for notification endpoints used by admin and voter pages.

import axios from "axios";

const client = axios.create({
  baseURL: "/api/notifications",
  headers: { "Content-Type": "application/json" },
});

/** Admin: create a notification (optionally targeted to a voterId) */
export const createNotification = (payload) => client.post("/", payload);

/** Admin: get all notifications */
export const getAllNotifications = () => client.get("/");

/** Admin: delete a notification by id */
export const deleteNotification = (id) => client.delete(`/${id}`);

/** Voter: get notifications for a voterId */
export const getNotificationsByVoter = (voterId) => client.get(`/${voterId}`);

/** Mark a notification as read (voter or admin) */
export const markAsRead = (id) => client.put(`/${id}/read`);

export default client;
