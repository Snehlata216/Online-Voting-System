// src/api/admins.js
// API client for admin endpoints, aligned with backend routes in adminRoutes.js

import client from "./client";

// Get all admins
export const listAdmins = () => client.get("/admins");

// Get single admin by id (not exposed in backend yet, optional)
export const getAdmin = (id) => client.get(`/admins/${id}`);

// Register new admin (backend uses /register)
export const registerAdmin = (payload) => client.post("/admins/register", payload);

// Login admin
export const loginAdmin = (payload) => client.post("/admins/login", payload);

// Delete admin by id
export const deleteAdmin = (id) => client.delete(`/admins/${id}`);
