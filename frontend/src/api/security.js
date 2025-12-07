// src/api/security.js
import axios from "axios";

const client = axios.create({
  baseURL: "/api/security",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Log a security event
export const logSecurityEvent = async (event) => {
  const res = await client.post("/log", event);
  return res.data;
};

// Get all security logs
export const getAllLogs = async () => {
  const res = await client.get("/logs");
  return res.data;
};
