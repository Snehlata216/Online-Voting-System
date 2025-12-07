// src/api/reports.js
// API helpers for reports endpoints (voter turnout, election summary, candidate votes, polls, feedback)
// Adds a getFeedbackReport helper and keeps existing safeGet behavior.
// Adjust baseURL if you don't use a dev proxy.

import axios from "axios";
import { normalize } from "../utils/apiUtils";

const client = axios.create({
  baseURL: "/api/reports",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach auth token if present
client.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  } catch (e) {
    // ignore
  }
  return cfg;
});

async function safeGet(path, fallback) {
  try {
    const res = await client.get(path);
    console.log(`[reports] GET ${path} response:`, res);
    return normalize(res, fallback);
  } catch (err) {
    console.error(`[reports] GET ${path} failed:`, err?.response ?? err);
    return fallback;
  }
}

/* Named exports for each report endpoint.
   - Keep shapes consistent: provide sensible fallbacks so UI can render defensively.
   - getFeedbackReport added so FeedbackReport.jsx can import it directly.
*/
export const getVoterTurnout = (id) => safeGet(`/voter-turnout/${id}`, {});
export const getElectionSummary = (id) => safeGet(`/election-summary/${id}`, {});
export const getCandidateVoteReport = (id) => safeGet(`/candidate-votes/${id}`, { candidates: [] });
export const getPollReport = (id) => safeGet(`/poll-report/${id}`, {});
export const getFeedbackSummary = (id) => safeGet(`/feedback-summary/${id}`, { feedback: [] });

/* New: fetch full feedback report (list or wrapped object) */
// replace or add this in src/api/reports.js
export const getFeedbackReport = (id) => safeGet(id ? `/feedback-summary/${id}` : `/feedback-summary`, { feedback: [], totalFeedbacks: 0, averageRating: null });


/* Default export for raw client if other modules need it */
export default client;
