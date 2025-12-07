// src/api/candidates.js
import client from "./client";

export const listCandidates = () => client.get("/candidates");
export const getCandidate = (id) => client.get(`/candidates/${id}`);
export const createCandidate = (payload) => client.post("/candidates", payload);
export const updateCandidate = (id, payload) => client.put(`/candidates/${id}`, payload);
export const deleteCandidate = (id) => client.delete(`/candidates/${id}`);
