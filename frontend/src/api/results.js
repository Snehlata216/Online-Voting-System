// src/api/results.js
import client from "./client";

// Get results for a specific election
export const getElectionResults = (electionId) =>
  client.get(`/results/${electionId}`);   // ✅ removed extra /api

// Get all results (admin overview)
export const listResults = () => client.get("/results");  // ✅ removed extra /api
