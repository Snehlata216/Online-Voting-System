// Authentication endpoints. Adjusted to use the voters login route you provided.
// If you later have a separate admin login endpoint you can add it here.

import client from "./client";

// Voter login endpoint on your backend: POST /api/voters/login
export const voterLogin = (payload) => client.post("/voters/login", payload);
// If backend route is /api/admins/login
export const adminLogin = (payload) => client.post("/admins/login", payload);

// Optional profile fetch (if backend exposes it). If not available, remove usage.
export const me = () => client.get("/auth/me");
