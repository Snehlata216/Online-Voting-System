// Voter-related API calls
import client from "./client";

// List all voters
export const listVoters = () => client.get("/voters");

// Get a single voter by id (used for editing form prefill)
export const getVoter = (id) => client.get(`/voters/${id}`);

// Create a new voter
export const createVoter = (payload) => client.post("/voters/register", payload);

// Update existing voter by id
export const updateVoter = (id, payload) => client.put(`/voters/${id}`, payload);

// Delete voter by id (used in list page)
export const deleteVoter = (id) => client.delete(`/voters/${id}`);

// Optional: check eligibility by voterId
export const checkEligibility = (voterId) => client.get(`/voters/${voterId}/eligibility`);
