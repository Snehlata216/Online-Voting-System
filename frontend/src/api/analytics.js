// src/api/analytics.js
import axios from "axios";

const client = axios.create({
  baseURL: "/api/analytics",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Admin dashboard overview
export const getAdminOverview = async () => {
  const res = await client.get("/overview");
  return res.data;
};

// Election turnout
export const getVoterTurnoutAnalytics = async (electionId) => {
  const res = await client.get(`/voter-turnout/${electionId}`);
  return res.data;
};

// Top candidates
export const getTopCandidates = async (electionId) => {
  const res = await client.get(`/top-candidates/${electionId}`);
  return res.data;
};

// Votes per day (graph data)
export const getVotesPerDay = async (electionId) => {
  const res = await client.get(`/votes-per-day/${electionId}`);
  return res.data;
};
