// src/api/votes.js
import client from "./client";

// Candidates (for election voting)
export const listCandidates = () => client.get("/candidates");

// Voters (admin only)
export const listVoters = () => client.get("/voters");

// 🗳️ Cast an election vote
export const castElectionVote = (payload) =>
  client.post(`/elections/${payload.electionId}/votes`, payload);

// 📊 Cast a poll vote
export const castPollVote = (pollId, payload) =>
  client.post(`/polls/${pollId}/votes`, payload);

// 🏁 Election Results
export const voteResults = (electionId) =>
  client.get(`/elections/${electionId}/results`);

export const allResults = () => client.get("/elections/votes");
