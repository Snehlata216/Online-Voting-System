// src/api/elections.js
import client from "./client";

// Get all elections
export const listElections = () => client.get("/elections");

// Get single election by id
export const getElection = (id) => client.get(`/elections/${id}`);

// Create new election
export const createElection = (payload) => client.post("/elections", payload);

// Update election
export const updateElection = (id, payload) => client.put(`/elections/${id}`, payload);

// Delete election
export const deleteElection = (id) => client.delete(`/elections/${id}`);

// ✅ Mark election as completed
export const completeElection = (id) => client.put(`/elections/${id}/complete`);
