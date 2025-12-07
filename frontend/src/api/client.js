// Shared axios client. Set VITE_API_URL in .env (e.g. VITE_API_URL=http://localhost:5000/api)
import axios from "axios";

const client = axios.create({
  // ✅ Always point directly to your backend API root
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false, // toggle true only if backend uses cookie-based auth
});

// ✅ Attach token if present
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default client;
