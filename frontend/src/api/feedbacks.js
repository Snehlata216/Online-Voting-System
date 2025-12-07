// src/api/feedbacks.js
// Simple axios wrapper for feedback endpoints
import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const createFeedback = (payload) => client.post("/feedbacks", payload);
export const listFeedbacks = () => client.get("/feedbacks");
export const deleteFeedback = (id) => client.delete(`/feedbacks/${id}`);


export default client;
